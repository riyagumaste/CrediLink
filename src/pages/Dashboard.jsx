import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">
      
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

      <main className="dashboard-content">
        
        <section className="welcome-section">
          <h2>Business Overview</h2>
          <p>
            Monitor your business trust, payment behaviour and financial insights.
          </p>
        </section>

        <section className="stats-grid">

          <div className="stat-card">
            <p className="stat-title">Trust Score</p>
            <h2>--</h2>
            <span>Calculated from business activity</span>
          </div>

          <div className="stat-card">
            <p className="stat-title">On-Time Payment Rate</p>
            <h2>--%</h2>
            <span>Based on payment history</span>
          </div>

          <div className="stat-card">
            <p className="stat-title">Average Payment Delay</p>
            <h2>-- Days</h2>
            <span>Based on completed transactions</span>
          </div>

        </section>

        <section className="insights-section">
          <h2>Credi Insights</h2>

          <div className="insight-box">
            Your business insights will appear here once transaction data is available.
          </div>
        </section>

      </main>

    </div>
  )
}

export default Dashboard