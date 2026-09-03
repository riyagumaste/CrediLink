import './LenderView.css'

function LenderView() {
  const borrower = {
    name: 'Credi Business User',
    trustScore: 82,
    paymentRate: 91,
    exposure: '₹12.4L',
    outstanding: '₹7.8L',
    monthlyInflow: '₹8.6L',
  }

  const indicators = [
    {
      name: 'Trust Score',
      value: '82 / 100',
      status: 'Strong',
    },
    {
      name: 'Payment Reliability',
      value: '91%',
      status: 'Strong',
    },
    {
      name: 'Outstanding Exposure',
      value: '₹7.8L',
      status: 'Moderate',
    },
    {
      name: 'Cash Flow',
      value: 'Positive',
      status: 'Healthy',
    },
  ]

  return (
    <div className="lender-page">

      {/* HEADER */}

      <header className="lender-header">

        <div>
          <p className="eyebrow">CREDI / LENDER INTELLIGENCE</p>

          <h1>Lender View</h1>

          <p>
            A consolidated view of business trust, financial behaviour
            and risk indicators for lending decisions.
          </p>
        </div>

        <div className="decision-badge">
          <span>Overall Assessment</span>
          <strong>Favourable</strong>
        </div>

      </header>


      {/* BORROWER */}

      <section className="lender-card borrower-card">

        <div className="borrower-avatar">
          C
        </div>

        <div className="borrower-info">

          <p className="section-label">BORROWER</p>

          <h2>{borrower.name}</h2>

          <span>Business ID: CRD-BS-1024</span>

        </div>

        <div className="profile-status">
          <span>Profile Status</span>
          <strong>Verified</strong>
        </div>

      </section>


      {/* SCORE */}

      <section className="lender-overview">

        <div className="lender-card score-panel">

          <p className="section-label">CREDI TRUST SCORE</p>

          <div className="lender-score">

            <strong>{borrower.trustScore}</strong>

            <span>/100</span>

          </div>

          <div className="score-label">
            Strong business trust
          </div>

          <p>
            Score based on observed business activity,
            payment behaviour and transaction reliability.
          </p>

        </div>


        <div className="lender-card indicators-panel">

          <p className="section-label">KEY INDICATORS</p>

          <div className="indicator-grid">

            {indicators.map((indicator) => (

              <div
                className="indicator"
                key={indicator.name}
              >

                <span>{indicator.name}</span>

                <strong>{indicator.value}</strong>

                <small>{indicator.status}</small>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* FINANCIAL SNAPSHOT */}

      <section className="lender-card financial-section">

        <div className="section-heading">

          <div>
            <p className="section-label">FINANCIAL SNAPSHOT</p>
            <h2>Business Position</h2>
          </div>

        </div>

        <div className="financial-grid">

          <div>
            <span>Total Exposure</span>
            <strong>{borrower.exposure}</strong>
          </div>

          <div>
            <span>Outstanding</span>
            <strong>{borrower.outstanding}</strong>
          </div>

          <div>
            <span>Monthly Inflow</span>
            <strong>{borrower.monthlyInflow}</strong>
          </div>

          <div>
            <span>Payment Rate</span>
            <strong>{borrower.paymentRate}%</strong>
          </div>

        </div>

      </section>


      {/* LENDING ASSESSMENT */}

      <section className="assessment-grid">

        <div className="lender-card assessment-card">

          <p className="section-label">LENDING ASSESSMENT</p>

          <h2>What the data suggests</h2>

          <div className="assessment-item positive">

            <span>✓</span>

            <div>
              <strong>Reliable payment behaviour</strong>

              <p>
                The business has maintained a high proportion
                of on-time payments.
              </p>
            </div>

          </div>

          <div className="assessment-item positive">

            <span>✓</span>

            <div>
              <strong>Positive cash movement</strong>

              <p>
                Recent inflows have remained above observed
                outflows.
              </p>
            </div>

          </div>

          <div className="assessment-item warning">

            <span>!</span>

            <div>
              <strong>Existing exposure should be considered</strong>

              <p>
                Current outstanding obligations should be included
                when assessing additional lending capacity.
              </p>
            </div>

          </div>

        </div>


        {/* DECISION SUPPORT */}

        <div className="lender-card decision-card">

          <p className="section-label">DECISION SUPPORT</p>

          <h2>Risk Profile</h2>

          <div className="risk-level">
            <strong>Moderate-Low</strong>
            <span>Based on available information</span>
          </div>

          <div className="risk-meter">
            <div />
          </div>

          <p>
            The available indicators suggest a relatively stable
            business profile. Additional verified information can
            improve confidence in the assessment.
          </p>

          <button>
            View Full Trust Profile
          </button>

        </div>

      </section>


      {/* DISCLAIMER */}

      <section className="lender-note">

        <strong>Data-driven assessment</strong>

        <p>
          This view presents business indicators to support
          decision-making. It does not replace independent
          lender due diligence.
        </p>

      </section>

    </div>
  )
}

export default LenderView