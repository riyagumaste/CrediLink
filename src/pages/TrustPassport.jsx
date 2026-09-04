import { useEffect, useState } from 'react'
import './TrustPassport.css'
import { getTrustPassportData } from '../services/trustService'

function TrustPassport() {
  const [business, setBusiness] = useState(null)
  const [trustScore, setTrustScore] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTrustPassport() {
      try {
        const data = await getTrustPassportData()

        setBusiness(data.business)
        setTrustScore(data.trustScore)
        setDocuments(data.documents || [])
      } catch (error) {
        console.error('Trust Passport loading error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTrustPassport()
  }, [])

  function formatDate(date) {
    if (!date) return 'Not available'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not available'
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="trust-passport-page">

      {/* Page introduction */}

      <header className="trust-passport-header">

        <div>

          <p className="eyebrow">
            CREDI / BUSINESS TRUST PROFILE
          </p>

          <h1>Trust Passport</h1>

          <p>
            A consolidated view of your business credibility,
            financial behaviour and trust performance.
          </p>

        </div>

      </header>


      {loading && (
        <p className="loading-message">
          Loading your Trust Passport...
        </p>
      )}


      {!loading && !business && (
        <p className="loading-message">
          Business information is not available.
        </p>
      )}


      {!loading && business && (

        <>

          {/* Business profile */}

          <section className="passport-business-card">

            <div>

              <p className="section-label">
                BUSINESS PROFILE
              </p>

              <h2>
                {business.business_name}
              </h2>

              <p>
                {business.industry || 'Industry not available'}
              </p>

            </div>


            <div className="passport-risk">

              <span>Risk Level</span>

              <strong>
                {trustScore?.risk_level || 'Not Rated'}
              </strong>

            </div>

          </section>


          {/* Overall trust score */}

          <section className="trust-score-section">

            <div className="overall-score">

              <p className="section-label">
                OVERALL TRUST SCORE
              </p>

              <div className="score-display">

                <strong>
                  {trustScore?.overall_score ?? '--'}
                </strong>

                <span>/100</span>

              </div>

              <p>
                Calculated from payment behaviour,
                transaction strength and financial stability.
              </p>

            </div>


            {/* Score breakdown */}

            <div className="score-breakdown">

              <div className="score-item">

                <span>
                  Payment Score
                </span>

                <strong>
                  {trustScore?.payment_score ?? '--'}
                </strong>

              </div>


              <div className="score-item">

                <span>
                  Transaction Score
                </span>

                <strong>
                  {trustScore?.transaction_score ?? '--'}
                </strong>

              </div>


              <div className="score-item">

                <span>
                  Financial Stability
                </span>

                <strong>
                  {trustScore?.financial_stability_score ?? '--'}
                </strong>

              </div>

            </div>

          </section>


          {/* Business information */}

          <section className="business-details">

            <p className="section-label">
              BUSINESS INFORMATION
            </p>

            <h2>
              Business Details
            </h2>

            <div className="details-grid">

              <div>

                <span>
                  Industry
                </span>

                <strong>
                  {business.industry || 'Not available'}
                </strong>

              </div>


              <div>

                <span>
                  Registration Number
                </span>

                <strong>
                  {business.registration_number ||
                    'Not available'}
                </strong>

              </div>


              <div>

                <span>
                  Founded
                </span>

                <strong>
                  {business.founded_year ||
                    'Not available'}
                </strong>

              </div>


              <div>

                <span>
                  Location
                </span>

                <strong>
                  {[business.city, business.country]
                    .filter(Boolean)
                    .join(', ') || 'Not available'}
                </strong>

              </div>

            </div>

          </section>


          {/* Financial trust indicators */}

          <section className="verification-section">

            <div className="section-heading">

              <div>

                <p className="section-label">
                  TRUST INDICATORS
                </p>

                <h2>
                  What Influences Your Trust Score
                </h2>

              </div>

            </div>


            <div className="verification-row">

              <div>

                <strong>
                  Payment Behaviour
                </strong>

                <span>
                  Measures how consistently the business
                  completes its payments on time.
                </span>

              </div>

              <div>

                <span>
                  Score
                </span>

                <strong>
                  {trustScore?.payment_score ?? '--'}
                </strong>

              </div>

              <div>

                <span>
                  Trust Factor
                </span>

                <small>
                  Payment reliability
                </small>

              </div>

            </div>


            <div className="verification-row">

              <div>

                <strong>
                  Transaction Activity
                </strong>

                <span>
                  Reflects the strength and consistency of
                  recorded business transactions.
                </span>

              </div>

              <div>

                <span>
                  Score
                </span>

                <strong>
                  {trustScore?.transaction_score ?? '--'}
                </strong>

              </div>

              <div>

                <span>
                  Trust Factor
                </span>

                <small>
                  Business activity
                </small>

              </div>

            </div>


            <div className="verification-row">

              <div>

                <strong>
                  Financial Stability
                </strong>

                <span>
                  Represents the financial stability indicated
                  by the available business activity and data.
                </span>

              </div>

              <div>

                <span>
                  Score
                </span>

                <strong>
                  {trustScore?.financial_stability_score ?? '--'}
                </strong>

              </div>

              <div>

                <span>
                  Trust Factor
                </span>

                <small>
                  Financial strength
                </small>

              </div>

            </div>

          </section>


          {/* Business documents */}

          <section className="documents-section">

            <div className="section-heading">

              <div>

                <p className="section-label">
                  BUSINESS DOCUMENTS
                </p>

                <h2>
                  Document Records
                </h2>

              </div>

              <span>
                {documents.length} Documents
              </span>

            </div>


            {documents.length === 0 && (

              <p>
                No documents have been uploaded yet.
              </p>

            )}


            {documents.map((document) => (

              <div
                className="document-row"
                key={document.id}
              >

                <div>

                  <strong>
                    {document.document_name}
                  </strong>

                  <span>
                    {document.document_type}
                  </span>

                </div>


                <div>

                  <span>
                    {document.status || 'Available'}
                  </span>

                  <small>
                    Uploaded{' '}
                    {formatDate(document.uploaded_at)}
                  </small>

                </div>

              </div>

            ))}

          </section>


          {/* Trust summary */}

          <section className="trust-summary">

            <p className="section-label">
              TRUST SUMMARY
            </p>

            <h2>
              {trustScore?.risk_level
                ? `${trustScore.risk_level} Risk Profile`
                : 'Trust Profile'}
            </h2>

            <p>
              Your Trust Passport combines payment behaviour,
              transaction activity and financial stability
              into a consolidated business trust profile.
            </p>

            <p>
              The score is based on observed business
              behaviour and available financial data rather
              than a separate verification score.
            </p>

          </section>

        </>

      )}

    </div>
  )
}

export default TrustPassport