import './ExposureReview.css'

function ExposureReview() {
  const exposure = {
    total: '₹12.4L',
    outstanding: '₹7.8L',
    overdue: '₹1.6L',
    counterparties: 8,
  }

  const counterparties = [
    {
      name: 'Northstar Supplies',
      exposure: '₹3.2L',
      percentage: 26,
      risk: 'Medium',
      status: 'Active',
    },
    {
      name: 'Apex Manufacturing',
      exposure: '₹2.8L',
      percentage: 23,
      risk: 'Low',
      status: 'Active',
    },
    {
      name: 'Vertex Components',
      exposure: '₹1.9L',
      percentage: 15,
      risk: 'High',
      status: 'Review',
    },
    {
      name: 'BluePeak Traders',
      exposure: '₹1.3L',
      percentage: 10,
      risk: 'Low',
      status: 'Active',
    },
  ]

  return (
    <div className="exposure-page">

      {/* HEADER */}

      <header className="exposure-header">
        <div>
          <p className="eyebrow">CREDI / RISK INTELLIGENCE</p>

          <h1>Exposure Review</h1>

          <p>
            Understand where your financial exposure is concentrated
            and identify areas that may require attention.
          </p>
        </div>

        <div className="review-status">
          Last reviewed
          <strong>Today</strong>
        </div>
      </header>


      {/* TOP METRICS */}

      <section className="exposure-metrics">

        <div className="exposure-card primary-metric">
          <p>Total Exposure</p>
          <strong>{exposure.total}</strong>
          <span>Across all active counterparties</span>
        </div>

        <div className="exposure-card">
          <p>Outstanding</p>
          <strong>{exposure.outstanding}</strong>
          <span>Currently unpaid</span>
        </div>

        <div className="exposure-card">
          <p>Overdue</p>
          <strong>{exposure.overdue}</strong>
          <span>Requires attention</span>
        </div>

        <div className="exposure-card">
          <p>Counterparties</p>
          <strong>{exposure.counterparties}</strong>
          <span>Currently active</span>
        </div>

      </section>


      {/* EXPOSURE OVERVIEW */}

      <section className="exposure-grid">

        <div className="exposure-card concentration-card">

          <div className="section-heading">
            <div>
              <p className="section-label">CONCENTRATION</p>
              <h2>Where is your exposure?</h2>
            </div>
          </div>

          <div className="concentration-bar">

            {counterparties.map((counterparty) => (
              <div
                key={counterparty.name}
                className="concentration-segment"
                style={{
                  width: `${counterparty.percentage}%`,
                }}
              />
            ))}

          </div>

          <div className="concentration-legend">

            {counterparties.map((counterparty) => (
              <div key={counterparty.name}>

                <span className="legend-dot" />

                <span>{counterparty.name}</span>

                <strong>{counterparty.percentage}%</strong>

              </div>
            ))}

          </div>

        </div>


        {/* RISK SUMMARY */}

        <div className="exposure-card risk-summary">

          <p className="section-label">RISK SUMMARY</p>

          <h2>Exposure Health</h2>

          <div className="health-score">
            <strong>Moderate</strong>
            <span>Requires monitoring</span>
          </div>

          <div className="risk-progress">
            <div />
          </div>

          <p className="risk-description">
            Most exposure is distributed across active counterparties,
            but a small number of higher-risk relationships require
            closer monitoring.
          </p>

        </div>

      </section>


      {/* COUNTERPARTY EXPOSURE */}

      <section className="exposure-card counterparty-exposure">

        <div className="section-heading">

          <div>
            <p className="section-label">COUNTERPARTY EXPOSURE</p>
            <h2>Exposure by Counterparty</h2>
          </div>

          <span className="section-note">
            {exposure.counterparties} active counterparties
          </span>

        </div>


        <div className="exposure-table">

          <div className="exposure-table-header">
            <span>Counterparty</span>
            <span>Exposure</span>
            <span>Share</span>
            <span>Risk</span>
            <span>Status</span>
          </div>


          {counterparties.map((counterparty) => (

            <div
              className="exposure-table-row"
              key={counterparty.name}
            >

              <strong>{counterparty.name}</strong>

              <span>{counterparty.exposure}</span>

              <span>{counterparty.percentage}%</span>

              <span
                className={`risk-badge ${counterparty.risk.toLowerCase()}`}
              >
                {counterparty.risk}
              </span>

              <span
                className={
                  counterparty.status === 'Review'
                    ? 'review-text'
                    : 'active-text'
                }
              >
                {counterparty.status}
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* ATTENTION */}

      <section className="attention-card">

        <div className="attention-icon">!</div>

        <div>

          <p className="section-label">ATTENTION REQUIRED</p>

          <h2>One counterparty requires review</h2>

          <p>
            Vertex Components currently represents ₹1.9L of exposure
            and has been marked as higher risk based on observed activity.
          </p>

        </div>

        <button>
          Review Counterparty
        </button>

      </section>

    </div>
  )
}

export default ExposureReview