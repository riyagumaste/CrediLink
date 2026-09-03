import { useEffect, useMemo, useState } from 'react'
import './ExposureReview.css'
import { getExposureData } from '../services/exposureService'

function ExposureReview() {
  const [counterparties, setCounterparties] = useState([])
  const [transactions, setTransactions] = useState([])

  const [selectedCounterparty, setSelectedCounterparty] =
    useState('all')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  /*
   * =========================================================
   * LOAD DATA
   * =========================================================
   */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const data = await getExposureData()

        setCounterparties(data.counterparties || [])
        setTransactions(data.transactions || [])
      } catch (err) {
        console.error('Exposure loading error:', err)

        setError(
          err.message ||
            'Unable to load exposure information.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])


  /*
   * =========================================================
   * BASIC METRICS
   * =========================================================
   */

  const totalTransactionValue = useMemo(() => {
    return transactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )
  }, [transactions])


  const outstandingTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.status !== 'paid'
    )
  }, [transactions])


  const outstandingExposure = useMemo(() => {
    return outstandingTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )
  }, [outstandingTransactions])


  /*
   * =========================================================
   * OVERDUE TRANSACTIONS
   * =========================================================
   */

  const overdueTransactions = useMemo(() => {
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    return outstandingTransactions.filter(
      (transaction) => {
        if (transaction.status === 'overdue') {
          return true
        }

        if (!transaction.due_date) {
          return false
        }

        const dueDate = new Date(
          transaction.due_date
        )

        dueDate.setHours(0, 0, 0, 0)

        return dueDate < today
      }
    )
  }, [outstandingTransactions])


  const overdueExposure = useMemo(() => {
    return overdueTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )
  }, [overdueTransactions])


  /*
   * =========================================================
   * COUNTERPARTY EXPOSURE
   * =========================================================
   */

  const counterpartyExposure = useMemo(() => {
    return counterparties.map((counterparty) => {
      const relatedTransactions =
        transactions.filter(
          (transaction) =>
            String(transaction.counterparty_id) ===
            String(counterparty.id)
        )

      const outstanding =
        relatedTransactions.filter(
          (transaction) =>
            transaction.status !== 'paid'
        )

      const overdue =
        overdueTransactions.filter(
          (transaction) =>
            String(transaction.counterparty_id) ===
            String(counterparty.id)
        )

      const outstandingAmount =
        outstanding.reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0
        )

      const overdueAmount =
        overdue.reduce(
          (total, transaction) =>
            total +
            Number(transaction.amount || 0),
          0
        )

      let risk = 'low'

      if (overdueAmount > 0) {
        risk = 'high'
      } else if (outstandingAmount > 0) {
        risk = 'medium'
      }

      return {
        ...counterparty,

        transactionCount:
          relatedTransactions.length,

        outstandingAmount,

        overdueAmount,

        risk,
      }
    })
  }, [
    counterparties,
    transactions,
    overdueTransactions,
  ])


  /*
   * =========================================================
   * SELECTED COUNTERPARTY
   * =========================================================
   */

  const selectedExposure = useMemo(() => {
    if (selectedCounterparty === 'all') {
      return null
    }

    return counterpartyExposure.find(
      (counterparty) =>
        String(counterparty.id) ===
        String(selectedCounterparty)
    )
  }, [
    counterpartyExposure,
    selectedCounterparty,
  ])


  /*
   * =========================================================
   * FILTERED EXPOSURE
   * =========================================================
   */

  const filteredExposure = useMemo(() => {
    if (selectedCounterparty === 'all') {
      return counterpartyExposure
    }

    return counterpartyExposure.filter(
      (counterparty) =>
        String(counterparty.id) ===
        String(selectedCounterparty)
    )
  }, [
    counterpartyExposure,
    selectedCounterparty,
  ])


  const sortedExposure = useMemo(() => {
    return [...filteredExposure].sort(
      (a, b) =>
        b.outstandingAmount -
        a.outstandingAmount
    )
  }, [filteredExposure])


  /*
   * =========================================================
   * SELECTED METRICS
   * =========================================================
   */

  const displayedOutstanding = selectedExposure
    ? selectedExposure.outstandingAmount
    : outstandingExposure

  const displayedOverdue = selectedExposure
    ? selectedExposure.overdueAmount
    : overdueExposure

  const displayedTransactionCount =
    selectedExposure
      ? selectedExposure.transactionCount
      : transactions.length


  /*
   * =========================================================
   * CURRENCY
   * =========================================================
   */

  function formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount || 0))
  }


  /*
   * =========================================================
   * RISK SUMMARY
   * =========================================================
   */

  function getRiskSummary() {
    if (selectedExposure) {
      if (
        selectedExposure.risk === 'high'
      ) {
        return {
          title: 'High exposure risk detected',
          description:
            'This counterparty has overdue financial exposure and may require closer monitoring.',
          level: 'High Attention',
          progress: '90%',
        }
      }

      if (
        selectedExposure.risk === 'medium'
      ) {
        return {
          title:
            'Outstanding exposure is being monitored',
          description:
            'This counterparty has unsettled transactions, but no overdue exposure has been identified.',
          level: 'Monitoring',
          progress: '58%',
        }
      }

      return {
        title:
          'No outstanding exposure detected',
        description:
          'This counterparty currently has no unpaid financial exposure.',
        level: 'Healthy',
        progress: '20%',
      }
    }


    if (overdueExposure > 0) {
      return {
        title:
          'Outstanding overdue exposure requires attention',
        description:
          'One or more counterparties have overdue obligations. Review these relationships and monitor payment behaviour closely.',
        level: 'High Attention',
        progress: '90%',
      }
    }


    if (outstandingExposure > 0) {
      return {
        title:
          'Outstanding exposure is being monitored',
        description:
          'There are unsettled transactions across your business relationships. Continue monitoring upcoming due dates.',
        level: 'Monitoring',
        progress: '58%',
      }
    }


    return {
      title:
        'No outstanding financial exposure detected',
      description:
        'All recorded transactions are currently settled.',
      level: 'Healthy',
      progress: '20%',
    }
  }


  const riskSummary = getRiskSummary()


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="exposure-page">

        <header className="exposure-header">
          <div>
            <p className="eyebrow">
              CREDI / RISK MANAGEMENT
            </p>

            <h1>Exposure Review</h1>

            <p>
              Monitor financial exposure across
              your business relationships.
            </p>
          </div>
        </header>

        <section className="exposure-card loading-card">
          <strong>
            Loading exposure data...
          </strong>

          <p>
            Please wait while CREDI retrieves your
            latest transaction information.
          </p>
        </section>

      </div>
    )
  }


  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error) {
    return (
      <div className="exposure-page">

        <header className="exposure-header">
          <div>
            <p className="eyebrow">
              CREDI / RISK MANAGEMENT
            </p>

            <h1>Exposure Review</h1>

            <p>
              Monitor financial exposure across
              your business relationships.
            </p>
          </div>
        </header>

        <section className="exposure-card error-card">

          <strong>
            Unable to load exposure data
          </strong>

          <p>{error}</p>

        </section>

      </div>
    )
  }


  /*
   * =========================================================
   * MAIN UI
   * =========================================================
   */

  return (
    <div className="exposure-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="exposure-header">

        <div>
          <p className="eyebrow">
            CREDI / RISK MANAGEMENT
          </p>

          <h1>Exposure Review</h1>

          <p>
            Monitor financial exposure across your
            business relationships and identify
            relationships requiring attention.
          </p>
        </div>

        <div className="review-status">

          <span>
            Review Status
          </span>

          <strong>
            {overdueExposure > 0
              ? 'Attention Required'
              : outstandingExposure > 0
              ? 'Monitoring'
              : 'Healthy'}
          </strong>

        </div>

      </header>


      {/* =====================================================
          METRICS
          ===================================================== */}

      <section className="exposure-metrics">

        <div className="exposure-card primary-metric">

          <p>
            {selectedExposure
              ? 'Selected Exposure'
              : 'Total Transaction Value'}
          </p>

          <strong>
            {formatAmount(
              selectedExposure
                ? selectedExposure.outstandingAmount
                : totalTransactionValue
            )}
          </strong>

          <span>
            {selectedExposure
              ? 'Outstanding amount for selected counterparty'
              : 'Across all recorded transactions'}
          </span>

        </div>


        <div className="exposure-card">

          <p>
            Outstanding Exposure
          </p>

          <strong>
            {formatAmount(
              displayedOutstanding
            )}
          </strong>

          <span>
            Unsettled financial obligations
          </span>

        </div>


        <div className="exposure-card">

          <p>
            Overdue Exposure
          </p>

          <strong>
            {formatAmount(
              displayedOverdue
            )}
          </strong>

          <span>
            Requires closer monitoring
          </span>

        </div>


        <div className="exposure-card">

          <p>
            Transactions
          </p>

          <strong>
            {displayedTransactionCount}
          </strong>

          <span>
            Recorded transaction activity
          </span>

        </div>

      </section>


      {/* =====================================================
          FILTER
          ===================================================== */}

      <section className="exposure-card exposure-filter">

        <div className="filter-content">

          <div>

            <p className="section-label">
              EXPOSURE FILTER
            </p>

            <h2>
              Review by Counterparty
            </h2>

            <span>
              Select a business relationship to
              focus the exposure analysis.
            </span>

          </div>


          <div className="filter-control">

            <label htmlFor="counterparty-filter">
              Counterparty
            </label>

            <select
              id="counterparty-filter"
              value={selectedCounterparty}
              onChange={(e) =>
                setSelectedCounterparty(
                  e.target.value
                )
              }
            >

              <option value="all">
                All Counterparties
              </option>

              {counterparties.map(
                (counterparty) => (
                  <option
                    key={counterparty.id}
                    value={counterparty.id}
                  >
                    {counterparty.name}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

      </section>


      {/* =====================================================
          ANALYSIS GRID
          ===================================================== */}

      <section className="exposure-grid">

        {/* ===================================================
            CONCENTRATION
            =================================================== */}

        <div className="exposure-card concentration-card">

          <div className="section-heading">

            <div>

              <p className="section-label">
                EXPOSURE CONCENTRATION
              </p>

              <h2>
                Outstanding Exposure
              </h2>

            </div>

          </div>


          {sortedExposure.length === 0 ? (

            <div className="empty-state">

              <strong>
                No exposure data available
              </strong>

              <p>
                There are no outstanding exposures
                to display.
              </p>

            </div>

          ) : (

            <>

              <div className="concentration-bar">

                {sortedExposure
                  .slice(0, 4)
                  .map((counterparty) => {

                    const total =
                      sortedExposure.reduce(
                        (sum, item) =>
                          sum +
                          item.outstandingAmount,
                        0
                      )

                    const percentage =
                      total > 0
                        ? (
                            counterparty.outstandingAmount /
                            total
                          ) * 100
                        : 0

                    return (
                      <div
                        key={counterparty.id}
                        className="concentration-segment"
                        style={{
                          width:
                            `${percentage}%`,
                        }}
                        title={`${counterparty.name}: ${Math.round(
                          percentage
                        )}%`}
                      />
                    )
                  })}

              </div>


              <div className="concentration-legend">

                {sortedExposure
                  .slice(0, 4)
                  .map((counterparty) => {

                    const total =
                      sortedExposure.reduce(
                        (sum, item) =>
                          sum +
                          item.outstandingAmount,
                        0
                      )

                    const percentage =
                      total > 0
                        ? Math.round(
                            (
                              counterparty.outstandingAmount /
                              total
                            ) * 100
                          )
                        : 0

                    return (
                      <div
                        key={counterparty.id}
                      >

                        <span className="legend-dot" />

                        <span>
                          {counterparty.name}
                        </span>

                        <strong>
                          {percentage}%
                        </strong>

                      </div>
                    )
                  })}

              </div>

            </>

          )}

        </div>


        {/* ===================================================
            RISK SUMMARY
            =================================================== */}

        <div className="exposure-card risk-summary">

          <p className="section-label">
            RISK SUMMARY
          </p>

          <div className="health-score">

            <strong>
              {riskSummary.level}
            </strong>

            <span>
              Current exposure assessment
            </span>

          </div>


          <div className="risk-progress">

            <div
              style={{
                width:
                  riskSummary.progress,
              }}
            />

          </div>


          <p className="risk-description">
            {riskSummary.description}
          </p>

        </div>

      </section>


      {/* =====================================================
          EXPOSURE TABLE
          ===================================================== */}

      <section className="exposure-card counterparty-exposure">

        <div className="section-heading">

          <div>

            <p className="section-label">
              COUNTERPARTY EXPOSURE
            </p>

            <h2>
              Exposure by Business
            </h2>

          </div>

          <span className="section-note">
            {sortedExposure.length}{' '}
            {sortedExposure.length === 1
              ? 'counterparty'
              : 'counterparties'}
          </span>

        </div>


        {sortedExposure.length === 0 ? (

          <div className="empty-state">

            <strong>
              No counterparties available
            </strong>

            <p>
              Add counterparties and transactions
              to begin monitoring financial exposure.
            </p>

          </div>

        ) : (

          <div className="exposure-table-wrapper">

            <div className="exposure-table">

              <div className="exposure-table-header">

                <span>
                  Counterparty
                </span>

                <span>
                  Transactions
                </span>

                <span>
                  Outstanding
                </span>

                <span>
                  Overdue
                </span>

                <span>
                  Risk
                </span>

              </div>


              {sortedExposure.map(
                (counterparty) => (

                  <div
                    className="exposure-table-row"
                    key={counterparty.id}
                  >

                    <strong
                      title={
                        counterparty.name
                      }
                    >
                      {counterparty.name}
                    </strong>

                    <span>
                      {counterparty.transactionCount}
                    </span>

                    <span>
                      {formatAmount(
                        counterparty.outstandingAmount
                      )}
                    </span>

                    <span>
                      {formatAmount(
                        counterparty.overdueAmount
                      )}
                    </span>

                    <span
                      className={`risk-badge ${counterparty.risk}`}
                    >
                      {counterparty.risk
                        .charAt(0)
                        .toUpperCase() +
                        counterparty.risk.slice(1)}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </section>


      {/* =====================================================
          RISK INSIGHT
          ===================================================== */}

      <section className="attention-card">

        <div className="attention-icon">
          !
        </div>


        <div>

          <p className="section-label">
            RISK INSIGHT
          </p>

          <h2>
            {riskSummary.title}
          </h2>

          <p>
            {riskSummary.description}
          </p>

        </div>

      </section>

    </div>
  )
}

export default ExposureReview