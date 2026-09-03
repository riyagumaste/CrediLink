import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

import {
  getBusinessData,
  getTrustScore,
  getTransactions
} from '../services/dashboardService'

function Dashboard() {
  const [business, setBusiness] = useState(null)
  const [trustScore, setTrustScore] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const businessData = await getBusinessData()

        if (!businessData) {
          console.error('No business found')
          return
        }

        const [scoreData, transactionData] = await Promise.all([
          getTrustScore(businessData.id),
          getTransactions(businessData.id)
        ])

        setBusiness(businessData)
        setTrustScore(scoreData)
        setTransactions(transactionData || [])
      } catch (error) {
        console.error('Dashboard loading error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const paidTransactions = transactions.filter((transaction) => {
    return (
      transaction.status?.toLowerCase() === 'paid' &&
      transaction.due_date &&
      transaction.paid_date
    )
  })

  const onTimeTransactions = paidTransactions.filter((transaction) => {
    const dueDate = new Date(transaction.due_date)
    const paidDate = new Date(transaction.paid_date)

    return paidDate <= dueDate
  })

  const onTimePaymentRate =
    paidTransactions.length > 0
      ? Math.round(
          (onTimeTransactions.length / paidTransactions.length) * 100
        )
      : null

  const paymentDelays = paidTransactions.map((transaction) => {
    const dueDate = new Date(transaction.due_date)
    const paidDate = new Date(transaction.paid_date)

    const difference =
      paidDate.getTime() - dueDate.getTime()

    return Math.max(
      0,
      Math.round(difference / (1000 * 60 * 60 * 24))
    )
  })

  const averagePaymentDelay =
    paymentDelays.length > 0
      ? Math.round(
          paymentDelays.reduce(
            (total, delay) => total + delay,
            0
          ) / paymentDelays.length
        )
      : null

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h1>Credi</h1>
          <p>Business Trust Intelligence</p>
        </div>

        <div className="profile">
          <span>Welcome back</span>

          <strong>
            {loading
              ? 'Loading...'
              : business?.business_name || 'Business User'}
          </strong>
        </div>

      </header>


      {/* Navigation */}
      <nav className="dashboard-nav">

        <Link to="/dashboard" className="nav-link active">
          Dashboard
        </Link>

        <Link to="/transactions" className="nav-link">
          Add Transaction
        </Link>

        <Link to="/cash-flow" className="nav-link">
          Cash Flow Watch
        </Link>

        <Link to="/trust-passport" className="nav-link">
          Trust Passport
        </Link>

        <Link to="/exposure-review" className="nav-link">
          Exposure Review
        </Link>

        <Link to="/counterparty-profile" className="nav-link">
          Counterparty Profile
        </Link>

        <Link to="/lender" className="nav-link">
          Lender View
        </Link>

      </nav>


      {/* Main content */}
      <main className="dashboard-content">

        <section className="welcome-section">

          <h2>Business Overview</h2>

          <p>
            Monitor your business trust, payment behaviour and financial insights.
          </p>

        </section>


        {/* Stats */}
        <section className="stats-grid">

          <div className="stat-card">

            <p className="stat-title">
              Trust Score
            </p>

            <h2>
              {loading
                ? '--'
                : trustScore?.overall_score ?? '--'}
            </h2>

            <span>
              Calculated from business activity
            </span>

          </div>


          <div className="stat-card">

            <p className="stat-title">
              On-Time Payment Rate
            </p>

            <h2>
              {loading
                ? '--%'
                : onTimePaymentRate !== null
                  ? `${onTimePaymentRate}%`
                  : 'No data'}
            </h2>

            <span>
              Based on completed payment history
            </span>

          </div>


          <div className="stat-card">

            <p className="stat-title">
              Average Payment Delay
            </p>

            <h2>
              {loading
                ? '-- Days'
                : averagePaymentDelay !== null
                  ? `${averagePaymentDelay} Days`
                  : 'No data'}
            </h2>

            <span>
              Based on completed transactions
            </span>

          </div>

        </section>


        {/* Insights */}
        <section className="insights-section">

          <h2>Credi Insights</h2>

          <div className="insight-box">

            {loading && (
              'Loading business insights...'
            )}

            {!loading && transactions.length === 0 && (
              'No transaction data is currently available.'
            )}

            {!loading && transactions.length > 0 && (
              <>
                Your business currently has{' '}
                <strong>{transactions.length}</strong>{' '}
                recorded transaction(s).

                {trustScore?.overall_score && (
                  <>
                    {' '}Your current trust score is{' '}
                    <strong>{trustScore.overall_score}</strong>.
                  </>
                )}

                {onTimePaymentRate !== null && (
                  <>
                    {' '}Your on-time payment rate is{' '}
                    <strong>{onTimePaymentRate}%</strong>.
                  </>
                )}
              </>
            )}

          </div>

        </section>


        {/* Quick actions */}
        <section className="quick-actions">

          <h2>Quick Actions</h2>

          <div className="quick-action-grid">

            <Link
              to="/transactions"
              className="quick-action-card"
            >
              <strong>Add Transaction</strong>

              <span>
                Record a new business transaction
              </span>
            </Link>


            <Link
              to="/cash-flow"
              className="quick-action-card"
            >
              <strong>View Cash Flow</strong>

              <span>
                Monitor incoming and outgoing payments
              </span>
            </Link>


            <Link
              to="/trust-passport"
              className="quick-action-card"
            >
              <strong>Trust Passport</strong>

              <span>
                View your business trust profile
              </span>
            </Link>


            <Link
              to="/exposure-review"
              className="quick-action-card"
            >
              <strong>Exposure Review</strong>

              <span>
                Analyse financial exposure
              </span>
            </Link>


            <Link
              to="/lender"
              className="quick-action-card"
            >
              <strong>Lender View</strong>

              <span>
                View the read-only business assessment for lenders
              </span>
            </Link>

          </div>

        </section>

      </main>

    </div>
  )
}

export default Dashboard