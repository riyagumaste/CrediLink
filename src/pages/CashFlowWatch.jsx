import { useEffect, useState } from 'react'
import './CashFlowWatch.css'
import { getCashFlowData } from '../services/cashFlowService'

function CashFlowWatch() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCashFlow() {
      try {
        const data = await getCashFlowData()

        setTransactions(data.transactions || [])

        console.log('CASH FLOW TRANSACTIONS:', data.transactions)
      } catch (error) {
        console.error('Cash flow loading error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCashFlow()
  }, [])


  // =========================
  // FORMAT INDIAN CURRENCY
  // =========================

  function formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount || 0))
  }


  // =========================
  // CASH FLOW CALCULATIONS
  // =========================

  // RECEIVABLE = money coming into the business
  const inflowTransactions = transactions.filter(
    (transaction) =>
      transaction.transaction_type?.toLowerCase() === 'receivable'
  )


  // PAYABLE = money going out of the business
  const outflowTransactions = transactions.filter(
    (transaction) =>
      transaction.transaction_type?.toLowerCase() === 'payable'
  )


  const totalInflow = inflowTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount || 0),
    0
  )


  const totalOutflow = outflowTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount || 0),
    0
  )


  const netFlow = totalInflow - totalOutflow


  // =========================
  // RECEIVABLES
  // =========================

  // All unpaid receivables
  const unpaidReceivables = transactions.filter(
    (transaction) =>
      transaction.transaction_type?.toLowerCase() === 'receivable' &&
      transaction.status?.toLowerCase() !== 'paid'
  )


  // Upcoming = pending receivables
  const upcomingReceivables = transactions.filter(
    (transaction) =>
      transaction.transaction_type?.toLowerCase() === 'receivable' &&
      transaction.status?.toLowerCase() === 'pending'
  )


  const upcomingAmount = upcomingReceivables.reduce(
    (total, transaction) =>
      total + Number(transaction.amount || 0),
    0
  )


  // Overdue receivables
  const overdueReceivables = transactions.filter(
    (transaction) =>
      transaction.transaction_type?.toLowerCase() === 'receivable' &&
      transaction.status?.toLowerCase() === 'overdue'
  )


  const overdueAmount = overdueReceivables.reduce(
    (total, transaction) =>
      total + Number(transaction.amount || 0),
    0
  )


  // =========================
  // MONTHLY FLOW
  // =========================

  const monthlyFlow = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)

    const monthName = date.toLocaleString('default', {
      month: 'short',
    })

    const month = date.getMonth()
    const year = date.getFullYear()

    const monthTransactions = transactions.filter(
      (transaction) => {
        if (!transaction.issue_date) return false

        const transactionDate = new Date(
          transaction.issue_date
        )

        return (
          transactionDate.getMonth() === month &&
          transactionDate.getFullYear() === year
        )
      }
    )


    const inflow = monthTransactions
      .filter(
        (transaction) =>
          transaction.transaction_type?.toLowerCase() ===
          'receivable'
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      )


    const outflow = monthTransactions
      .filter(
        (transaction) =>
          transaction.transaction_type?.toLowerCase() ===
          'payable'
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      )


    monthlyFlow.push({
      month: monthName,
      inflow,
      outflow,
    })
  }


  // =========================
  // CHART SCALING
  // =========================

  const maxValue = Math.max(
    ...monthlyFlow.flatMap((month) => [
      month.inflow,
      month.outflow,
    ]),
    1
  )


  // =========================
  // RECEIVABLES TABLE
  // =========================

  const receivables = unpaidReceivables
    .sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1

      return (
        new Date(a.due_date) -
        new Date(b.due_date)
      )
    })
    .slice(0, 5)


  function getDueText(dueDate) {
    if (!dueDate) return 'No due date'

    const today = new Date()
    const due = new Date(dueDate)

    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const difference = Math.ceil(
      (due - today) /
      (1000 * 60 * 60 * 24)
    )

    if (difference < 0) {
      return `${Math.abs(difference)} days overdue`
    }

    if (difference === 0) {
      return 'Due today'
    }

    return `Due in ${difference} days`
  }


  function getReceivableStatus(transaction) {
    if (
      transaction.status?.toLowerCase() === 'overdue'
    ) {
      return 'At Risk'
    }

    if (
      transaction.due_date &&
      new Date(transaction.due_date) < new Date()
    ) {
      return 'At Risk'
    }

    return 'Expected'
  }


  // =========================
  // CASH HEALTH
  // =========================

  let healthScore = 50

  if (netFlow > 0) {
    healthScore += 20
  }

  if (upcomingAmount > 0) {
    healthScore += 10
  }

  // Reduce score for overdue transactions
  const overdueTransactions = transactions.filter(
    (transaction) =>
      transaction.status?.toLowerCase() === 'overdue'
  )

  healthScore -= overdueTransactions.length * 5

  healthScore = Math.max(
    0,
    Math.min(100, healthScore)
  )


  let healthStatus = 'Needs Attention'

  if (healthScore >= 75) {
    healthStatus = 'Healthy'
  } else if (healthScore >= 50) {
    healthStatus = 'Stable'
  }


  // =========================
  // PAGE
  // =========================

  return (
    <div className="cashflow-page">

      {/* HEADER */}

      <header className="cashflow-header">

        <div>

          <p className="eyebrow">
            CREDI / FINANCIAL MONITORING
          </p>

          <h1>Cash Flow Watch</h1>

          <p>
            Monitor cash movement, upcoming receivables and potential
            payment pressure.
          </p>

        </div>


        <div className="cash-health">

          <span>Cash Flow Health</span>

          <strong>
            {loading ? 'Loading...' : healthStatus}
          </strong>

        </div>

      </header>


      {/* SUMMARY */}

      <section className="cash-summary">

        <div className="cash-card">

          <p>Cash Inflow</p>

          <strong>
            {loading
              ? '--'
              : formatAmount(totalInflow)}
          </strong>

          <span>Total receivables</span>

        </div>


        <div className="cash-card">

          <p>Cash Outflow</p>

          <strong>
            {loading
              ? '--'
              : formatAmount(totalOutflow)}
          </strong>

          <span>Total payables</span>

        </div>


        <div className="cash-card net-card">

          <p>Net Cash Flow</p>

          <strong>
            {loading
              ? '--'
              : formatAmount(netFlow)}
          </strong>

          <span>
            {netFlow >= 0
              ? 'Positive movement'
              : 'Negative movement'}
          </span>

        </div>


        <div className="cash-card">

          <p>Upcoming Receivables</p>

          <strong>
            {loading
              ? '--'
              : formatAmount(upcomingAmount)}
          </strong>

          <span>Pending payments expected</span>

        </div>

      </section>


      {/* TREND + HEALTH */}

      <section className="cashflow-grid">

        {/* CHART */}

        <div className="cash-card chart-card">

          <div className="section-heading">

            <div>

              <p className="section-label">
                CASH MOVEMENT
              </p>

              <h2>Receivables vs Payables</h2>

            </div>

            <span>Last 6 months</span>

          </div>


          <div className="flow-chart">

            {monthlyFlow.map((month) => {

              const inflowHeight =
                `${(month.inflow / maxValue) * 100}%`

              const outflowHeight =
                `${(month.outflow / maxValue) * 100}%`

              return (

                <div
                  className="chart-column"
                  key={month.month}
                >

                  <div className="bars">

                    <div
                      className="flow-bar inflow"
                      style={{
                        height: inflowHeight,
                      }}
                      title={`Receivables: ${formatAmount(
                        month.inflow
                      )}`}
                    />

                    <div
                      className="flow-bar outflow"
                      style={{
                        height: outflowHeight,
                      }}
                      title={`Payables: ${formatAmount(
                        month.outflow
                      )}`}
                    />

                  </div>

                  <span>{month.month}</span>

                </div>

              )
            })}

          </div>


          <div className="chart-legend">

            <div>
              <span className="legend inflow-dot" />
              Receivables
            </div>

            <div>
              <span className="legend outflow-dot" />
              Payables
            </div>

          </div>

        </div>


        {/* HEALTH */}

        <div className="cash-card health-card">

          <p className="section-label">
            CASH POSITION
          </p>

          <h2>Current Health</h2>


          <div className="health-score">

            <strong>
              {loading ? '--' : healthScore}
            </strong>

            <span>/100</span>

          </div>


          <div className="health-progress">

            <div
              style={{
                width: `${healthScore}%`,
              }}
            />

          </div>


          <p className="health-status">
            {healthStatus} cash position
          </p>


          <p className="health-description">

            {overdueAmount > 0
              ? `${formatAmount(overdueAmount)} in receivables requires attention due to overdue payments.`
              : netFlow >= 0
                ? 'Current receivables exceed payables, supporting a positive cash position.'
                : 'Current payables exceed receivables and may require financial attention.'}

          </p>

        </div>

      </section>


      {/* RECEIVABLES */}

      <section className="cash-card receivables-section">

        <div className="section-heading">

          <div>

            <p className="section-label">
              UPCOMING CASH
            </p>

            <h2>Receivables Watch</h2>

          </div>

          <span>Unpaid receivables</span>

        </div>


        <div className="receivables-table">

          <div className="receivables-header">

            <span>Counterparty</span>
            <span>Amount</span>
            <span>Due</span>
            <span>Status</span>

          </div>


          {loading && (
            <p>Loading receivables...</p>
          )}


          {!loading && receivables.length === 0 && (
            <p>No unpaid receivables found.</p>
          )}


          {receivables.map((item) => {

            const status = getReceivableStatus(item)

            return (

              <div
                className="receivable-row"
                key={item.id}
              >

                <strong>
                  {item.counterparties?.name ||
                    'Unknown Counterparty'}
                </strong>


                <span>
                  {formatAmount(item.amount)}
                </span>


                <span>
                  {getDueText(item.due_date)}
                </span>


                <span
                  className={
                    status === 'Expected'
                      ? 'expected-status'
                      : 'risk-status'
                  }
                >
                  {status}
                </span>

              </div>

            )
          })}

        </div>

      </section>


      {/* ALERT */}

      {!loading && overdueTransactions.length > 0 && (

        <section className="cash-alert">

          <div className="alert-icon">
            !
          </div>


          <div>

            <p className="section-label">
              WATCH ITEM
            </p>


            <h2>
              {overdueTransactions.length} payment
              {overdueTransactions.length > 1 ? 's' : ''}
              {' '} may require attention
            </h2>


            <p>
              There are overdue transactions totaling financial
              obligations that may affect your business cash flow
              and risk profile.
            </p>

          </div>

        </section>

      )}

    </div>
  )
}

export default CashFlowWatch