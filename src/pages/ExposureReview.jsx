import { useEffect, useState } from 'react'
import './ExposureReview.css'
import { getExposureData } from '../services/exposureService'

function ExposureReview() {
  const [counterparties, setCounterparties] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadExposureData() {
      try {
        const data = await getExposureData()

        setCounterparties(data.counterparties)
        setTransactions(data.transactions)
      } catch (error) {
        console.error('Exposure loading error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadExposureData()
  }, [])


  function formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount || 0))
  }


  // ===================================
  // OUTSTANDING TRANSACTIONS
  // ===================================

  const outstandingTransactions = transactions.filter(
    (transaction) =>
      transaction.status !== 'paid'
  )


  const totalExposure = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount || 0),
    0
  )


  const outstandingExposure =
    outstandingTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )


  // ===================================
  // OVERDUE TRANSACTIONS
  // ===================================

  const today = new Date()

  const overdueTransactions =
    outstandingTransactions.filter(
      (transaction) => {

        if (!transaction.due_date) {
          return transaction.status === 'overdue'
        }

        const dueDate =
          new Date(transaction.due_date)

        return (
          transaction.status === 'overdue' ||
          dueDate < today
        )
      }
    )


  const overdueExposure =
    overdueTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )


  // ===================================
  // COUNTERPARTY EXPOSURE
  // ===================================

  const counterpartyExposure =
    counterparties.map((counterparty) => {

      const relatedTransactions =
        transactions.filter(
          (transaction) =>
            transaction.counterparty_id ===
            counterparty.id
        )


      const outstanding =
        relatedTransactions.filter(
          (transaction) =>
            transaction.status !== 'paid'
        )


      const exposureAmount =
        outstanding.reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0
        )


      const overdue =
        outstanding.filter(
          (transaction) => {

            if (!transaction.due_date) {
              return transaction.status === 'overdue'
            }

            return (
              transaction.status === 'overdue' ||
              new Date(transaction.due_date) < today
            )
          }
        )


      const overdueAmount =
        overdue.reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0
        )


      // ===============================
      // SIMPLE RISK CALCULATION
      // ===============================

      let riskLevel = 'Low'

      if (overdueAmount > 0) {
        riskLevel = 'High'
      } else if (exposureAmount > 0) {
        riskLevel = 'Medium'
      }

      return {
        ...counterparty,
        transactionCount:
          relatedTransactions.length,
        exposureAmount,
        overdueAmount,
        riskLevel,
      }
    })


  // Sort highest exposure first

  const sortedExposure =
    [...counterpartyExposure].sort(
      (a, b) =>
        b.exposureAmount - a.exposureAmount
    )


  // ===================================
  // OVERALL RISK
  // ===================================

  let overallRisk = 'Low'

  if (overdueExposure > 0) {
    overallRisk = 'High'
  } else if (outstandingExposure > 0) {
    overallRisk = 'Medium'
  }


  return (
    <div className="exposure-page">

      {/* HEADER */}

      <header className="exposure-header">

        <div>

          <p className="eyebrow">
            CREDI / RISK INTELLIGENCE
          </p>

          <h1>Exposure Review</h1>

          <p>
            Monitor outstanding obligations, counterparty
            exposure and potential financial risk.
          </p>

        </div>


        <div className="risk-badge">

          <span>Overall Risk</span>

          <strong>
            {loading
              ? 'Loading...'
              : overallRisk}
          </strong>

        </div>

      </header>


      {/* SUMMARY CARDS */}

      <section className="exposure-summary">

        <div className="exposure-card">

          <p>Total Transaction Value</p>

          <strong>
            {loading
              ? '--'
              : formatAmount(totalExposure)}
          </strong>

          <span>
            All recorded transactions
          </span>

        </div>


        <div className="exposure-card">

          <p>Outstanding Exposure</p>

          <strong>
            {loading
              ? '--'
              : formatAmount(outstandingExposure)}
          </strong>

          <span>
            Pending transactions
          </span>

        </div>


        <div className="exposure-card risk-card">

          <p>Overdue Exposure</p>

          <strong>
            {loading
              ? '--'
              : formatAmount(overdueExposure)}
          </strong>

          <span>
            Requires attention
          </span>

        </div>


        <div className="exposure-card">

          <p>Counterparties</p>

          <strong>
            {loading
              ? '--'
              : counterparties.length}
          </strong>

          <span>
            Business relationships
          </span>

        </div>

      </section>


      {/* COUNTERPARTY RISK TABLE */}

      <section className="counterparty-exposure-section">

        <div className="section-heading">

          <div>

            <p className="section-label">
              COUNTERPARTY EXPOSURE
            </p>

            <h2>
              Exposure by Business
            </h2>

          </div>

          <span>
            {counterparties.length} Counterparties
          </span>

        </div>


        {loading && (
          <p>
            Loading exposure information...
          </p>
        )}


        {!loading &&
          sortedExposure.length === 0 && (

          <p>
            No counterparties found.
          </p>

        )}


        {!loading &&
          sortedExposure.map(
            (counterparty) => (

              <div
                className="exposure-row"
                key={counterparty.id}
              >

                {/* NAME */}

                <div className="counterparty-name">

                  <strong>
                    {counterparty.name}
                  </strong>

                  <span>
                    {counterparty.industry ||
                      'Industry not available'}
                  </span>

                </div>


                {/* TRANSACTIONS */}

                <div>

                  <span>Transactions</span>

                  <strong>
                    {counterparty.transactionCount}
                  </strong>

                </div>


                {/* EXPOSURE */}

                <div>

                  <span>Outstanding</span>

                  <strong>
                    {formatAmount(
                      counterparty.exposureAmount
                    )}
                  </strong>

                </div>


                {/* OVERDUE */}

                <div>

                  <span>Overdue</span>

                  <strong>
                    {formatAmount(
                      counterparty.overdueAmount
                    )}
                  </strong>

                </div>


                {/* RISK */}

                <div>

                  <span
                    className={`risk-${counterparty.riskLevel.toLowerCase()}`}
                  >
                    {counterparty.riskLevel}
                  </span>

                </div>

              </div>

            )
          )}

      </section>


      {/* RISK INSIGHT */}

      {!loading && (

        <section className="risk-insight">

          <p className="section-label">
            RISK INSIGHT
          </p>

          <h2>
            {overdueExposure > 0
              ? 'Outstanding overdue exposure requires attention'
              : outstandingExposure > 0
              ? 'Outstanding exposure is being monitored'
              : 'No outstanding financial exposure detected'}
          </h2>

          <p>

            {overdueExposure > 0 &&
              `${formatAmount(overdueExposure)} is currently associated with overdue transactions.`
            }

            {overdueExposure === 0 &&
              outstandingExposure > 0 &&
              `${formatAmount(outstandingExposure)} remains outstanding across your business relationships.`
            }

            {outstandingExposure === 0 &&
              'All currently recorded transactions appear to be settled.'
            }

          </p>

        </section>

      )}

    </div>
  )
}

export default ExposureReview