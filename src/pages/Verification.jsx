import './Verification.css'

function Verification() {
  const checks = [
    {
      name: 'Business Identity',
      description: 'Business name and submitted identity information',
      status: 'Verified',
    },
    {
      name: 'Business Registration',
      description: 'Registration details provided by the business',
      status: 'Verified',
    },
    {
      name: 'Financial Information',
      description: 'Financial information available for assessment',
      status: 'Pending',
    },
    {
      name: 'Transaction Evidence',
      description: 'Historical transaction information used by Credi',
      status: 'Pending',
    },
  ]

  return (
    <div className="verification-page">

      <header className="verification-header">
        <div>
          <p className="eyebrow">CREDI / VERIFICATION</p>

          <h1>Business Verification</h1>

          <p>
            Review the information and checks used to establish
            business authenticity and data confidence.
          </p>
        </div>

        <div className="verification-status">
          <span>Overall Status</span>
          <strong>Partially Verified</strong>
        </div>
      </header>


      <section className="verification-overview">

        <div className="verification-card identity-card">

          <div className="identity-icon">
            C
          </div>

          <div>
            <p className="section-label">BUSINESS</p>
            <h2>Credi Business User</h2>
            <span>Business ID: CRD-BS-1024</span>
          </div>

        </div>


        <div className="verification-card progress-card">

          <p className="section-label">VERIFICATION PROGRESS</p>

          <div className="progress-number">
            <strong>2</strong>
            <span>/ 4 checks completed</span>
          </div>

          <div className="verification-progress">
            <div />
          </div>

          <p>
            Complete the remaining checks to improve confidence
            in the business profile.
          </p>

        </div>

      </section>


      <section className="verification-card checks-section">

        <div className="section-heading">
          <div>
            <p className="section-label">VERIFICATION CHECKS</p>
            <h2>Verification Checklist</h2>
          </div>
        </div>


        <div className="checks-list">

          {checks.map((check) => (

            <div
              className="check-row"
              key={check.name}
            >

              <div className="check-icon">
                {check.status === 'Verified' ? '✓' : '…'}
              </div>

              <div className="check-information">

                <strong>{check.name}</strong>

                <p>{check.description}</p>

              </div>

              <span
                className={
                  check.status === 'Verified'
                    ? 'verified'
                    : 'pending'
                }
              >
                {check.status}
              </span>

            </div>

          ))}

        </div>

      </section>


      <section className="verification-grid">

        <div className="verification-card">

          <p className="section-label">DATA CONFIDENCE</p>

          <h2>Information Quality</h2>

          <div className="confidence-score">
            <strong>72</strong>
            <span>/100</span>
          </div>

          <div className="confidence-bar">
            <div />
          </div>

          <p className="description">
            The current profile contains enough verified information
            to begin assessment, but additional evidence can improve
            confidence.
          </p>

        </div>


        <div className="verification-card next-step-card">

          <p className="section-label">NEXT STEP</p>

          <h2>Complete verification</h2>

          <p>
            Additional financial and transaction information is
            required to complete the remaining checks.
          </p>

          <button>
            Continue Verification
          </button>

        </div>

      </section>

    </div>
  )
}

export default Verification