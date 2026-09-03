import './TrustPassport.css'

function TrustPassport() {
  const business = {
    name: 'Apex Manufacturing Pvt. Ltd.',
    id: 'CRD-BUS-1042',
    trustScore: 82,
    paymentRate: 94,
    averageDelay: 2.4,
    transactions: 47,
  }

  const trustFactors = [
    {
      name: 'Payment Reliability',
      value: 94,
      description: 'Most invoices are paid on time.',
    },
    {
      name: 'Transaction Consistency',
      value: 82,
      description: 'Transaction behaviour remains relatively stable.',
    },
    {
      name: 'Counterparty Reliability',
      value: 89,
      description: 'Most counterparties have completed transactions successfully.',
    },
    {
      name: 'Financial Stability',
      value: 73,
      description: 'Some variation has been observed in recent activity.',
    },
  ]

  return (
    <div className="trust-passport">

      <header className="trust-header">
        <div>
          <p className="eyebrow">CREDI / TRUST INTELLIGENCE</p>
          <h1>Financial Trust Passport</h1>
          <p>
            A transparent overview of this business's financial trust behaviour.
          </p>
        </div>

        <div className="verification-badge">
          ✓ Verified Business
        </div>
      </header>


      {/* BUSINESS INFORMATION */}

      <section className="business-card">

        <div>
          <p className="section-label">BUSINESS</p>
          <h2>{business.name}</h2>
          <p className="business-id">{business.id}</p>
        </div>

        <div className="business-status">
          <span>Verification</span>
          <strong>Verified</strong>
        </div>

      </section>


      {/* TRUST SCORE */}

      <section className="trust-overview">

        <div className="trust-score-card">

          <p className="section-label">OVERALL TRUST SCORE</p>

          <div className="score-circle">
            <span>{business.trustScore}</span>
            <small>/100</small>
          </div>

          <h3>Strong Trust Profile</h3>

          <p>
            Based on payment behaviour, transaction consistency,
            counterparty reliability and financial activity.
          </p>

        </div>


        <div className="metrics-card">

          <div className="metric">
            <span>On-Time Payment Rate</span>
            <strong>{business.paymentRate}%</strong>
          </div>

          <div className="metric">
            <span>Average Payment Delay</span>
            <strong>{business.averageDelay} days</strong>
          </div>

          <div className="metric">
            <span>Transactions Analyzed</span>
            <strong>{business.transactions}</strong>
          </div>

        </div>

      </section>


      {/* TRUST FACTORS */}

      <section className="trust-factors">

        <div className="section-heading">
          <div>
            <p className="section-label">TRUST ANALYSIS</p>
            <h2>Trust Factors</h2>
          </div>
        </div>


        <div className="factor-grid">

          {trustFactors.map((factor) => (

            <div className="factor-card" key={factor.name}>

              <div className="factor-top">

                <div>
                  <h3>{factor.name}</h3>
                  <p>{factor.description}</p>
                </div>

                <strong>{factor.value}%</strong>

              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${factor.value}%` }}
                />
              </div>

            </div>

          ))}

        </div>

      </section>


      {/* EXPLAINABILITY */}

      <section className="explainability">

        <div>
          <p className="section-label">EXPLAINABILITY</p>
          <h2>Why this score?</h2>
          <p className="explain-description">
            Credi makes the factors behind the trust score visible
            instead of presenting a black-box number.
          </p>
        </div>


        <div className="evidence-list">

          <div className="evidence positive">
            <span>✓</span>
            <p>
              <strong>94% of payments</strong> were completed on time.
            </p>
          </div>

          <div className="evidence positive">
            <span>✓</span>
            <p>
              Average payment delay is only <strong>2.4 days</strong>.
            </p>
          </div>

          <div className="evidence positive">
            <span>✓</span>
            <p>
              <strong>41 of 47 transactions</strong> were completed without
              major issues.
            </p>
          </div>

          <div className="evidence warning">
            <span>!</span>
            <p>
              <strong>3 transactions</strong> showed significant payment delays.
            </p>
          </div>

        </div>

      </section>

    </div>
  )
}

export default TrustPassport