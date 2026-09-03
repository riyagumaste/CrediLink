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
    // Handle browser CORS preflight
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return Response.json(
        { error: "Only POST requests are allowed" },
        {
          status: 405,
          headers: corsHeaders,
        },
      );
    }

    if (!GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key is not configured" },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return Response.json(
        { error: "Supabase configuration is missing" },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    // Get the user's JWT
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return Response.json(
        { error: "Authentication required" },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create a Supabase client using the user's auth context.
    // This means RLS policies still apply.
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );

    // Verify the logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json(
        { error: "Invalid or expired authentication" },
        {
          status: 401,
          headers: corsHeaders,
        },
      );
    }

    const body = await req.json();
    const question = body?.question;

    if (!question || typeof question !== "string") {
      return Response.json(
        { error: "Question is required" },
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // --------------------------------------------------
    // 1. Get the business belonging to the logged-in user
    // --------------------------------------------------

    const { data: business, error: businessError } = await supabase
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
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();

    if (businessError) {
      console.error("Business query error:", businessError);

      return Response.json(
        { error: "Could not retrieve business information" },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    if (!business) {
      return Response.json(
        { error: "No business found for this user" },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    const businessId = business.id;

    // --------------------------------------------------
    // 2. Get the latest trust score
    // --------------------------------------------------

    const { data: trustScore, error: trustError } = await supabase
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
      .order("calculated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (trustError) {
      console.error("Trust score query error:", trustError);
    }

    // --------------------------------------------------
    // 3. Get transactions
    // --------------------------------------------------

    const { data: transactions, error: transactionsError } = await supabase
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
      .order("created_at", { ascending: false })
      .limit(50);

    if (transactionsError) {
      console.error("Transactions query error:", transactionsError);
    }

    // --------------------------------------------------
    // 4. Get counterparties
    // --------------------------------------------------

    const { data: counterparties, error: counterpartiesError } =
      await supabase
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
      console.error("Counterparty query error:", counterpartiesError);
    }

    // --------------------------------------------------
    // 5. Get verification records
    // --------------------------------------------------

    const { data: verifications, error: verificationError } =
      await supabase
        .from("verification_records")
        .select(`
          verification_type,
          status,
          verification_score,
          verified_at,
          remarks
        `)
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

    if (verificationError) {
      console.error("Verification query error:", verificationError);
    }

    // --------------------------------------------------
    // 6. Get document verification information
    // --------------------------------------------------

    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select(`
        document_name,
        document_type,
        uploaded_at,
        status
      `)
      .eq("business_id", businessId);

    if (documentsError) {
      console.error("Documents query error:", documentsError);
    }

    // --------------------------------------------------
    // 7. Build the data context for Gemini
    // --------------------------------------------------

    const businessContext = {
      business,
      trust_score: trustScore ?? null,
      transactions: transactions ?? [],
      counterparties: counterparties ?? [],
      verification_records: verifications ?? [],
      documents: documents ?? [],
    };

    // --------------------------------------------------
    // 8. Ask Gemini
    // --------------------------------------------------

    const systemPrompt = `
You are Ask Credi, the AI assistant inside CrediLink.

Your job is to explain the business data provided below clearly and accurately.

IMPORTANT RULES:

1. Use ONLY the supplied business data.
2. Never invent financial figures, scores, transactions, counterparties,
   verification results, or dates.
3. If the supplied data does not contain the answer, clearly say that
   the available CrediLink data does not provide enough information.
4. Do not claim that you calculated or changed the official trust score.
5. Treat trust_scores.overall_score as the existing CrediLink score.
6. Explain WHY a score may be high or low by referring to the component
   scores and underlying verification/transaction information.
7. Keep answers understandable for a business owner.
8. For financial-risk questions, distinguish between facts from the data
   and reasonable interpretation.
9. Never reveal passwords, API keys, authentication tokens, or secrets.

CURRENT CREDILINK BUSINESS DATA:

${JSON.stringify(businessContext, null, 2)}
`;

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          system_instruction: {
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
                  text: question,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();

      console.error("Gemini error:", errorText);

      return Response.json(
        { error: "Gemini API request failed" },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    const geminiData = await geminiResponse.json();

    const answer =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate an answer.";

    return Response.json(
      {
        answer,
        business: business.business_name,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("Ask Credi error:", error);

    return Response.json(
      {
        error: "Something went wrong while processing your question",
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
});