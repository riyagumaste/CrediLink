import { useEffect, useState } from 'react'
import './TrustPassport.css'
import { getTrustPassportData } from '../services/trustService'

function TrustPassport() {
  const [business, setBusiness] = useState(null)
  const [trustScore, setTrustScore] = useState(null)
  const [verifications, setVerifications] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTrustPassport() {
      try {
        const data = await getTrustPassportData()

        setBusiness(data.business)
        setTrustScore(data.trustScore)
        setVerifications(data.verifications)
        setDocuments(data.documents)

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

    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }


  const verifiedRecords = verifications.filter(
    (record) => record.status === 'verified'
  )

  const pendingRecords = verifications.filter(
    (record) => record.status !== 'verified'
  )


  return (
    <div className="trust-passport-page">

      {/* HEADER */}

      <header className="trust-passport-header">

        <div>

          <p className="eyebrow">
            CREDI / BUSINESS TRUST PROFILE
          </p>

          <h1>Trust Passport</h1>

          <p>
            A consolidated view of your business credibility,
            verification and trust performance.
          </p>

        </div>

      </header>


      {loading && (
        <p className="loading-message">
          Loading your Trust Passport...
        </p>
      )}


      {!loading && business && (

        <>

          {/* BUSINESS PROFILE */}

          <section className="passport-business-card">

            <div>

              <p className="section-label">
                VERIFIED BUSINESS
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


          {/* OVERALL TRUST SCORE */}

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
                verification and transaction activity.
              </p>

            </div>


            {/* SCORE BREAKDOWN */}

            <div className="score-breakdown">

              <div className="score-item">

                <span>Payment Score</span>

                <strong>
                  {trustScore?.payment_score ?? '--'}
                </strong>

              </div>


              <div className="score-item">

                <span>Verification Score</span>

                <strong>
                  {trustScore?.verification_score ?? '--'}
                </strong>

              </div>


              <div className="score-item">

                <span>Transaction Score</span>

                <strong>
                  {trustScore?.transaction_score ?? '--'}
                </strong>

              </div>

            </div>

          </section>


          {/* BUSINESS INFORMATION */}

          <section className="business-details">

            <p className="section-label">
              BUSINESS INFORMATION
            </p>

            <h2>Business Details</h2>

            <div className="details-grid">

              <div>
                <span>Industry</span>

                <strong>
                  {business.industry || 'Not available'}
                </strong>
              </div>


              <div>
                <span>Registration Number</span>

                <strong>
                  {business.registration_number ||
                    'Not available'}
                </strong>
              </div>


              <div>
                <span>Founded</span>

                <strong>
                  {business.founded_year ||
                    'Not available'}
                </strong>
              </div>


              <div>
                <span>Location</span>

                <strong>
                  {[business.city, business.country]
                    .filter(Boolean)
                    .join(', ') || 'Not available'}
                </strong>
              </div>

            </div>

          </section>


          {/* VERIFICATION */}

          <section className="verification-section">

            <div className="section-heading">

              <div>

                <p className="section-label">
                  BUSINESS VERIFICATION
                </p>

                <h2>Verification Records</h2>

              </div>

              <span>
                {verifiedRecords.length} Verified
              </span>

            </div>


            {verifications.length === 0 && (

              <p>
                No verification records are available yet.
              </p>

            )}


            {verifications.map((record) => (

              <div
                className="verification-row"
                key={record.id}
              >

                <div>

                  <strong>
                    {record.verification_type}
                  </strong>

                  <span>
                    {record.remarks ||
                      'No additional remarks'}
                  </span>

                </div>


                <div>

                  <span>Score</span>

                  <strong>
                    {record.verification_score ?? '--'}
                  </strong>

                </div>


                <div>

                  <span>
                    {record.status}
                  </span>

                  <small>
                    {formatDate(record.verified_at)}
                  </small>

                </div>

              </div>

            ))}

          </section>


          {/* DOCUMENTS */}

          <section className="documents-section">

            <div className="section-heading">

              <div>

                <p className="section-label">
                  BUSINESS DOCUMENTS
                </p>

                <h2>Document Records</h2>

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
                    {document.status || 'Unknown'}
                  </span>

                  <small>
                    Uploaded{' '}
                    {formatDate(document.uploaded_at)}
                  </small>

                </div>

              </div>

            ))}

          </section>


          {/* TRUST STATUS */}

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
              Your Trust Passport combines your verification
              records, transaction activity and payment behaviour
              into a consolidated business trust profile.
            </p>

            <p>
              {pendingRecords.length > 0 &&
                `${pendingRecords.length} verification record(s) may still require attention.`}
            </p>

          </section>

        </>

      )}

    </div>
  )
}

export default TrustPassport