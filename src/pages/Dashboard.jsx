import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">

        <div>
          <h1>Credi</h1>
          <p>Business Trust Intelligence</p>
        </div>

        <div className="profile">
          <span>Welcome back</span>
          <strong>Business User</strong>
        </div>

      </header>


      {/* NAVIGATION */}
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

      </nav>


      {/* MAIN CONTENT */}
      <main className="dashboard-content">

        <section className="welcome-section">
          <h2>Business Overview</h2>

          <p>
            Monitor your business trust, payment behaviour and financial insights.
          </p>
        </section>


        {/* STATS */}
        <section className="stats-grid">

          <div className="stat-card">
            <p className="stat-title">Trust Score</p>

            <h2>--</h2>

            <span>
              Calculated from business activity
            </span>
          </div>


          <div className="stat-card">
            <p className="stat-title">
              On-Time Payment Rate
            </p>

            <h2>--%</h2>

            <span>
              Based on payment history
            </span>
          </div>


          <div className="stat-card">
            <p className="stat-title">
              Average Payment Delay
            </p>

            <h2>-- Days</h2>

            <span>
              Based on completed transactions
            </span>
          </div>

        </section>


        {/* INSIGHTS */}
        <section className="insights-section">

          <h2>Credi Insights</h2>

          <div className="insight-box">
            Your business insights will appear here once
            transaction data is available.
          </div>

        </section>


        {/* QUICK ACTIONS */}
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

          </div>

        </section>

      </main>

    </div>
  )
}

export default Dashboard