import { createClient } from "npm:@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  try {
    // ==================================================
    // CORS
    // ==================================================

    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return Response.json(
        {
          error: "Only POST requests are allowed",
        },
        {
          status: 405,
          headers: corsHeaders,
        },
      );
    }

    // ==================================================
    // ENVIRONMENT CHECK
    // ==================================================

    if (!GEMINI_API_KEY) {
      return Response.json(
        {
          error: "Gemini API key is not configured",
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return Response.json(
        {
          error: "Supabase configuration is missing",
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    // ==================================================
    // READ QUESTION
    // ==================================================

    const body = await req.json();
    const question = body?.question;

    if (!question || typeof question !== "string") {
      return Response.json(
        {
          error: "Question is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      return Response.json(
        {
          error: "Question cannot be empty",
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // ==================================================
    // SUPABASE CLIENT
    // ==================================================

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
    );

    // ==================================================
    // 1. GET BUSINESS
    // ==================================================

    const {
      data: business,
      error: businessError,
    } = await supabase
      .from("businesses")
      .select(`
        id,
        business_name,
        industry,
        registration_number,
        email,
        phone,
        address,
        city,
        country,
        founded_year
      `)
      .limit(1)
      .maybeSingle();

    if (businessError) {
      console.error(
        "Business query error:",
        businessError,
      );

      return Response.json(
        {
          error:
            "Could not retrieve business information",
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    if (!business) {
      return Response.json(
        {
          error: "No business data was found",
        },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    const businessId = business.id;

    // ==================================================
    // 2. GET TRUST SCORE
    // ==================================================

    const {
      data: trustScore,
      error: trustError,
    } = await supabase
      .from("trust_scores")
      .select(`
        overall_score,
        payment_score,
        verification_score,
        transaction_score,
        risk_level,
        calculated_at
      `)
      .eq("business_id", businessId)
      .order("calculated_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (trustError) {
      console.error(
        "Trust score query error:",
        trustError,
      );
    }

    // ==================================================
    // 3. GET TRANSACTIONS
    // ==================================================

    const {
      data: transactions,
      error: transactionsError,
    } = await supabase
      .from("transactions")
      .select(`
        id,
        counterparty_id,
        transaction_type,
        amount,
        currency,
        invoice_number,
        issue_date,
        due_date,
        paid_date,
        status,
        description,
        created_at
      `)
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false,
      })
      .limit(100);

    if (transactionsError) {
      console.error(
        "Transactions query error:",
        transactionsError,
      );
    }

    // ==================================================
    // 4. GET COUNTERPARTIES
    // ==================================================

    const {
      data: counterparties,
      error: counterpartiesError,
    } = await supabase
      .from("counterparties")
      .select(`
        id,
        name,
        type,
        industry,
        trust_level
      `)
      .eq("business_id", businessId);

    if (counterpartiesError) {
      console.error(
        "Counterparty query error:",
        counterpartiesError,
      );
    }

    // ==================================================
    // 5. GET VERIFICATION RECORDS
    // ==================================================

    const {
      data: verifications,
      error: verificationError,
    } = await supabase
      .from("verification_records")
      .select(`
        verification_type,
        status,
        verification_score,
        verified_at,
        remarks
      `)
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false,
      });

    if (verificationError) {
      console.error(
        "Verification query error:",
        verificationError,
      );
    }

    // ==================================================
    // 6. GET DOCUMENTS
    // ==================================================

    const {
      data: documents,
      error: documentsError,
    } = await supabase
      .from("documents")
      .select(`
        document_name,
        document_type,
        uploaded_at,
        status
      `)
      .eq("business_id", businessId);

    if (documentsError) {
      console.error(
        "Documents query error:",
        documentsError,
      );
    }

    // ==================================================
    // NORMALIZE DATA
    // ==================================================

    const safeTransactions =
      transactions ?? [];

    const safeCounterparties =
      counterparties ?? [];

    const safeVerifications =
      verifications ?? [];

    const safeDocuments =
      documents ?? [];

    // ==================================================
    // 7. CALCULATE USEFUL BUSINESS METRICS
    //
    // These are calculated by code.
    // Gemini only explains them.
    // ==================================================

    const paidTransactions =
      safeTransactions.filter(
        (transaction) =>
          transaction.status?.toLowerCase() ===
            "paid" &&
          transaction.paid_date,
      );

    const unpaidTransactions =
      safeTransactions.filter(
        (transaction) =>
          transaction.status?.toLowerCase() !==
          "paid",
      );

    const onTimeTransactions =
      paidTransactions.filter(
        (transaction) => {
          if (
            !transaction.due_date ||
            !transaction.paid_date
          ) {
            return false;
          }

          const dueDate = new Date(
            transaction.due_date,
          );

          const paidDate = new Date(
            transaction.paid_date,
          );

          return paidDate <= dueDate;
        },
      );

    const lateTransactions =
      paidTransactions.filter(
        (transaction) => {
          if (
            !transaction.due_date ||
            !transaction.paid_date
          ) {
            return false;
          }

          const dueDate = new Date(
            transaction.due_date,
          );

          const paidDate = new Date(
            transaction.paid_date,
          );

          return paidDate > dueDate;
        },
      );

    const paymentDelays =
      lateTransactions
        .map((transaction) => {
          const dueDate = new Date(
            transaction.due_date,
          );

          const paidDate = new Date(
            transaction.paid_date,
          );

          const difference =
            paidDate.getTime() -
            dueDate.getTime();

          return Math.round(
            difference /
              (1000 * 60 * 60 * 24),
          );
        })
        .filter(
          (days) => Number.isFinite(days),
        );

    const averagePaymentDelay =
      paymentDelays.length > 0
        ? paymentDelays.reduce(
            (sum, days) => sum + days,
            0,
          ) / paymentDelays.length
        : 0;

    const onTimeRate =
      paidTransactions.length > 0
        ? (onTimeTransactions.length /
            paidTransactions.length) *
          100
        : null;

    const totalTransactionValue =
      safeTransactions.reduce(
        (sum, transaction) => {
          const amount =
            Number(transaction.amount) || 0;

          return sum + amount;
        },
        0,
      );

    const outstandingValue =
      unpaidTransactions.reduce(
        (sum, transaction) => {
          const amount =
            Number(transaction.amount) || 0;

          return sum + amount;
        },
        0,
      );

    // ==================================================
    // 8. COUNTERPARTY TRANSACTION SUMMARY
    // ==================================================

    const counterpartySummaries =
      safeCounterparties.map(
        (counterparty) => {
          const relatedTransactions =
            safeTransactions.filter(
              (transaction) =>
                transaction.counterparty_id ===
                counterparty.id,
            );

          const paid =
            relatedTransactions.filter(
              (transaction) =>
                transaction.status?.toLowerCase() ===
                "paid",
            );

          const late =
            paid.filter((transaction) => {
              if (
                !transaction.due_date ||
                !transaction.paid_date
              ) {
                return false;
              }

              return (
                new Date(
                  transaction.paid_date,
                ) >
                new Date(
                  transaction.due_date,
                )
              );
            });

          const totalValue =
            relatedTransactions.reduce(
              (sum, transaction) =>
                sum +
                (Number(transaction.amount) ||
                  0),
              0,
            );

          return {
            id: counterparty.id,
            name: counterparty.name,
            type: counterparty.type,
            industry: counterparty.industry,
            trust_level:
              counterparty.trust_level,
            transaction_count:
              relatedTransactions.length,
            paid_transaction_count:
              paid.length,
            late_transaction_count:
              late.length,
            total_transaction_value:
              totalValue,
          };
        },
      );

    // ==================================================
    // 9. COMPLETE METRICS OBJECT
    // ==================================================

    const metrics = {
      transaction_count:
        safeTransactions.length,

      paid_transaction_count:
        paidTransactions.length,

      unpaid_transaction_count:
        unpaidTransactions.length,

      on_time_transaction_count:
        onTimeTransactions.length,

      late_transaction_count:
        lateTransactions.length,

      on_time_payment_rate:
        onTimeRate !== null
          ? Number(onTimeRate.toFixed(2))
          : null,

      average_payment_delay_days:
        Number(
          averagePaymentDelay.toFixed(2),
        ),

      total_transaction_value:
        totalTransactionValue,

      outstanding_transaction_value:
        outstandingValue,

      counterparty_count:
        safeCounterparties.length,

      verification_record_count:
        safeVerifications.length,

      document_count:
        safeDocuments.length,
    };

    // ==================================================
    // 10. BUILD CONTEXT
    // ==================================================

    const businessContext = {
      business,

      trust_score:
        trustScore ?? null,

      calculated_metrics:
        metrics,

      transactions:
        safeTransactions,

      counterparties:
        safeCounterparties,

      counterparty_summaries:
        counterpartySummaries,

      verification_records:
        safeVerifications,

      documents:
        safeDocuments,
    };

    // ==================================================
    // 11. AI SYSTEM PROMPT
    // ==================================================

    const systemPrompt = `
You are Ask Credi, the AI assistant inside CrediLink.

You help business owners understand their business,
transactions, payment behavior, counterparties,
verification status, trust score, cash flow and risk.

You are both a business assistant and a CrediLink
data explainer.

==================================================
IMPORTANT RESPONSE RULES
==================================================

1. ANSWER THE USER'S ACTUAL QUESTION.

Do not automatically say "there is not enough information."

First determine what kind of question the user asked.

--------------------------------------------------
TYPE A: GENERAL QUESTIONS
--------------------------------------------------

If the user asks a general business, finance, risk,
payment, credit, or accounting question, you may answer
using your general knowledge.

Examples:

"What is cash flow?"

"What does a high trust score mean?"

"What is payment risk?"

"How can a business reduce late payments?"

"Why are unpaid invoices risky?"

These questions do NOT require exact database information.

Answer them normally and clearly.

--------------------------------------------------
TYPE B: CREDILINK-SPECIFIC QUESTIONS
--------------------------------------------------

If the user asks about their CrediLink business,
trust score, transactions, payments, counterparties,
verification or risk, use the supplied CrediLink data.

Examples:

"What is my trust score?"

"Why is my trust score low?"

"Which transactions may affect my risk?"

"Which customer pays the slowest?"

"How many transactions do I have?"

"What is my payment performance?"

"Which counterparties have the highest exposure?"

For these questions, use the actual supplied data.

--------------------------------------------------
TYPE C: MIXED QUESTIONS
--------------------------------------------------

If a question contains both general and business-specific
parts, answer both parts.

For example:

"Why are late payments risky and do I have late payments?"

Explain the general concept AND then explain the user's
actual late-payment data.

--------------------------------------------------
WHEN DATA IS MISSING
--------------------------------------------------

Do NOT respond with a generic:

"I don't have enough information."

Instead:

1. Answer whatever CAN be answered.
2. Clearly identify the specific missing information.
3. Explain what data would be needed.

Example:

"The available transaction records show that 3 payments
were late. Late payments can increase cash-flow pressure
because expected cash arrives after the agreed due date.
The data does not contain enough historical information
to determine whether this is a long-term trend."

That is much better than simply saying there is not
enough information.

==================================================
DATA ACCURACY RULES
==================================================

1. Never invent CrediLink-specific numbers.

2. Never invent transaction amounts.

3. Never invent counterparties.

4. Never invent trust scores.

5. Never invent verification results.

6. Never invent dates.

7. Never invent payment history.

8. Use calculated_metrics for calculated financial metrics.

9. Do not change or create the official CrediLink trust
   score.

10. Treat trust_score.overall_score as the official
    existing CrediLink trust score.

11. Treat payment_score, verification_score and
    transaction_score as components of that score.

12. When explaining risk, clearly distinguish between:
    - actual facts
    - calculated metrics
    - reasonable interpretation

==================================================
RISK QUESTIONS
==================================================

When a user asks about risk:

Look at:

- trust score
- payment score
- verification score
- transaction score
- payment delays
- unpaid transactions
- outstanding value
- transaction volume
- counterparty behavior
- verification status

Explain which available indicators are relevant.

Do NOT claim that a transaction definitely causes the
official trust score to change unless the data explicitly
states that.

Use language such as:

"may contribute to risk"

"could indicate"

"is an important risk indicator"

rather than making unsupported claims.

==================================================
TRUST SCORE QUESTIONS
==================================================

When explaining the trust score:

Start with the actual score if available.

Then explain the component scores.

Then connect those components to the available evidence.

For example:

"Your current trust score is 78. The payment component
is 82, while the verification component is 75. This
suggests payment behavior is relatively stronger than
verification evidence."

Only use numbers actually supplied in the data.

==================================================
TRANSACTION QUESTIONS
==================================================

For questions about transactions:

Use the transaction records and calculated metrics.

You can discuss:

- paid transactions
- unpaid transactions
- late payments
- on-time payments
- payment rate
- payment delay
- transaction amounts
- outstanding amounts
- transaction types
- transaction descriptions
- invoice dates
- due dates
- paid dates

==================================================
COUNTERPARTY QUESTIONS
==================================================

For counterparty questions:

Use counterparty_summaries when possible.

Discuss:

- transaction count
- paid transactions
- late transactions
- total transaction value
- trust level
- industry
- type

Do not invent relationships that aren't in the data.

==================================================
FINANCIAL SAFETY
==================================================

CrediLink is an intelligence and evidence platform.

You are NOT a lender.

You do NOT approve loans.

You do NOT reject loans.

You do NOT make final financial decisions.

When appropriate, remind the user that the information
is an analytical aid rather than a final lending decision.

==================================================
STYLE
==================================================

Be concise but useful.

Use simple business language.

Do not sound robotic.

Do not repeatedly say "according to the data."

Do not repeat the user's question unnecessarily.

When useful, use short bullet points.

Give a direct answer first, followed by explanation.

==================================================
CURRENT CREDILINK BUSINESS DATA
==================================================

${JSON.stringify(businessContext, null, 2)}
`;

    // ==================================================
    // 12. CALL GEMINI
    // ==================================================

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: cleanQuestion,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 700,
          },
        }),
      },
    );

    // ==================================================
    // 13. GEMINI ERROR
    // ==================================================

    if (!geminiResponse.ok) {
      const errorText =
        await geminiResponse.text();

      console.error(
        "Gemini API error:",
        errorText,
      );

      return Response.json(
        {
          error:
            "Gemini API request failed. Please try again.",
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    // ==================================================
    // 14. PARSE GEMINI RESPONSE
    // ==================================================

    const geminiData =
      await geminiResponse.json();

    const answer =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer) {
      console.error(
        "Unexpected Gemini response:",
        JSON.stringify(geminiData),
      );

      return Response.json(
        {
          error:
            "Gemini returned an empty response.",
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    // ==================================================
    // 15. RETURN RESPONSE
    // ==================================================

    return Response.json(
      {
        answer: answer.trim(),

        business:
          business.business_name,

        metrics,
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error(
      "Ask Credi error:",
      error,
    );

    return Response.json(
      {
        error:
          "Something went wrong while processing your question.",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});