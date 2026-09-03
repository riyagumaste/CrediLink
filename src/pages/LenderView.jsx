import { useEffect, useMemo, useState } from 'react'
import './LenderView.css'

import {
  getBusinessData,
  getTrustScore,
  getTransactions
} from '../services/dashboardService'

function LenderView() {
  const [business, setBusiness] = useState(null)
  const [trustScore, setTrustScore] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadLenderView() {
      try {
        setLoading(true)
        setError('')

        const businessData = await getBusinessData()

        if (!businessData) {
          throw new Error('Business information could not be found.')
        }

        const [scoreData, transactionData] = await Promise.all([
          getTrustScore(businessData.id),
          getTransactions(businessData.id)
        ])

        setBusiness(businessData)
        setTrustScore(scoreData)
        setTransactions(transactionData || [])
      } catch (error) {
        console.error('Lender View loading error:', error)

        setError(
          error.message ||
          'Unable to load lender assessment.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadLenderView()
  }, [])

  const paidTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.status?.toLowerCase() === 'paid'
    )
  }, [transactions])

  const completedWithDates = useMemo(() => {
    return paidTransactions.filter(
      (transaction) =>
        transaction.due_date &&
        transaction.paid_date
    )
  }, [paidTransactions])

  const onTimeTransactions = useMemo(() => {
    return completedWithDates.filter(
      (transaction) =>
        new Date(transaction.paid_date) <=
        new Date(transaction.due_date)
    )
  }, [completedWithDates])

  const lateTransactions = useMemo(() => {
    return completedWithDates.filter(
      (transaction) =>
        new Date(transaction.paid_date) >
        new Date(transaction.due_date)
    )
  }, [completedWithDates])

  const outstandingTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) =>
        transaction.status?.toLowerCase() !== 'paid'
    )
  }, [transactions])

  const overdueTransactions = useMemo(() => {
    const today = new Date()

    return outstandingTransactions.filter(
      (transaction) => {
        if (!transaction.due_date) {
          return false
        }

        return new Date(transaction.due_date) < today
      }
    )
  }, [outstandingTransactions])

  const totalTransactionValue = useMemo(() => {
    return transactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )
  }, [transactions])

  const outstandingExposure = useMemo(() => {
    return outstandingTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )
  }, [outstandingTransactions])

  const overdueExposure = useMemo(() => {
    return overdueTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )
  }, [overdueTransactions])

  const onTimeRate = useMemo(() => {
    if (completedWithDates.length === 0) {
      return null
    }

    return Math.round(
      (onTimeTransactions.length /
        completedWithDates.length) *
        100
    )
  }, [completedWithDates, onTimeTransactions])

  const paymentDelays = useMemo(() => {
    return completedWithDates.map((transaction) => {
      const dueDate = new Date(transaction.due_date)
      const paidDate = new Date(transaction.paid_date)

      const difference =
        paidDate.getTime() -
        dueDate.getTime()

      return Math.max(
        0,
        Math.round(
          difference /
            (1000 * 60 * 60 * 24)
        )
      )
    })
  }, [completedWithDates])

  const averagePaymentDelay = useMemo(() => {
    if (paymentDelays.length === 0) {
      return null
    }

    return Math.round(
      paymentDelays.reduce(
        (total, delay) => total + delay,
        0
      ) / paymentDelays.length
    )
  }, [paymentDelays])

  const worstPaymentDelay = useMemo(() => {
    if (paymentDelays.length === 0) {
      return null
    }

    return Math.max(...paymentDelays)
  }, [paymentDelays])

  const activeCounterparties = useMemo(() => {
    const ids = transactions
      .map(
        (transaction) =>
          transaction.counterparty_id
      )
      .filter(Boolean)

    return new Set(ids).size
  }, [transactions])

  const outstandingPercentage = useMemo(() => {
    if (totalTransactionValue === 0) {
      return 0
    }

    return Math.round(
      (outstandingExposure /
        totalTransactionValue) *
        100
    )
  }, [
    outstandingExposure,
    totalTransactionValue
  ])

  const overduePercentage = useMemo(() => {
    if (totalTransactionValue === 0) {
      return 0
    }

    return Math.round(
      (overdueExposure /
        totalTransactionValue) *
        100
    )
  }, [
    overdueExposure,
    totalTransactionValue
  ])

  const relationshipTrend = useMemo(() => {
    if (completedWithDates.length < 2) {
      return 'Insufficient data'
    }

    const sorted = [...completedWithDates].sort(
      (a, b) =>
        new Date(a.due_date) -
        new Date(b.due_date)
    )

    const midpoint = Math.floor(
      sorted.length / 2
    )

    const previous = sorted.slice(0, midpoint)
    const recent = sorted.slice(midpoint)

    const calculateRate = (items) => {
      if (!items.length) {
        return null
      }

      const onTime = items.filter(
        (transaction) =>
          new Date(transaction.paid_date) <=
          new Date(transaction.due_date)
      )

      return (
        onTime.length / items.length
      )
    }

    const previousRate =
      calculateRate(previous)

    const recentRate =
      calculateRate(recent)

    if (
      previousRate === null ||
      recentRate === null
    ) {
      return 'Insufficient data'
    }

    if (
      recentRate >
      previousRate + 0.05
    ) {
      return 'Improving'
    }

    if (
      recentRate <
      previousRate - 0.05
    ) {
      return 'Worsening'
    }

    return 'Stable'
  }, [completedWithDates])

  const trustScoreValue =
    trustScore?.overall_score ?? null

  const trustAssessment = useMemo(() => {
    if (trustScoreValue === null) {
      return {
        label: 'Assessment Pending',
        className: 'neutral'
      }
    }

    if (trustScoreValue >= 80) {
      return {
        label: 'Strong',
        className: 'positive'
      }
    }

    if (trustScoreValue >= 60) {
      return {
        label: 'Moderate',
        className: 'warning'
      }
    }

    return {
      label: 'Needs Review',
      className: 'negative'
    }
  }, [trustScoreValue])

  const riskFlags = useMemo(() => {
    const flags = []

    if (
      onTimeRate !== null &&
      onTimeRate >= 80
    ) {
      flags.push({
        type: 'positive',
        icon: '✓',
        title: 'Strong repayment history',
        description:
          `${onTimeRate}% of tracked completed payments were made on time.`
      })
    } else if (
      onTimeRate !== null
    ) {
      flags.push({
        type: 'warning',
        icon: '!',
        title: 'Payment behaviour requires attention',
        description:
          `${onTimeRate}% of tracked completed payments were made on time.`
      })
    } else {
      flags.push({
        type: 'neutral',
        icon: '—',
        title: 'Limited repayment history',
        description:
          'There is not enough completed payment data to assess repayment consistency.'
      })
    }

    if (
      overdueTransactions.length === 0 &&
      transactions.length > 0
    ) {
      flags.push({
        type: 'positive',
        icon: '✓',
        title: 'No overdue exposure detected',
        description:
          'No currently recorded transaction is past its due date.'
      })
    } else if (
      overdueTransactions.length > 0
    ) {
      flags.push({
        type: 'warning',
        icon: '!',
        title: 'Overdue exposure detected',
        description:
          `${overdueTransactions.length} transaction(s) are currently past their due date.`
      })
    }

    if (
      activeCounterparties >= 3
    ) {
      flags.push({
        type: 'positive',
        icon: '✓',
        title: 'Established business network',
        description:
          `Recorded activity exists across ${activeCounterparties} counterparties.`
      })
    } else {
      flags.push({
        type: 'neutral',
        icon: '—',
        title: 'Limited relationship history',
        description:
          'The available transaction data contains a relatively small counterparty network.'
      })
    }

    return flags
  }, [
    onTimeRate,
    overdueTransactions,
    transactions,
    activeCounterparties
  ])

  function formatAmount(
    amount,
    currency = 'INR'
  ) {
    try {
      return new Intl.NumberFormat(
        'en-IN',
        {
          style: 'currency',
          currency,
          maximumFractionDigits: 0
        }
      ).format(Number(amount || 0))
    } catch {
      return `₹${Number(
        amount || 0
      ).toLocaleString('en-IN')}`
    }
  }

  function formatDate(date) {
    if (!date) {
      return '—'
    }

    const parsedDate = new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '—'
    }

    return parsedDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    )
  }

  function getPaymentDelay(transaction) {
    if (
      !transaction.due_date ||
      !transaction.paid_date
    ) {
      return null
    }

    const difference =
      new Date(
        transaction.paid_date
      ).getTime() -
      new Date(
        transaction.due_date
      ).getTime()

    return Math.max(
      0,
      Math.round(
        difference /
          (1000 * 60 * 60 * 24)
      )
    )
  }

  function handleDownloadPdf() {
    window.print()
  }

  if (loading) {
    return (
      <div className="lender-view">
        <section className="lender-state-card">
          <div className="lender-loading-spinner" />

          <h2>
            Preparing lender assessment
          </h2>

          <p>
            Retrieving verified business,
            transaction and trust information.
          </p>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lender-view">
        <section className="lender-state-card lender-error-state">
          <div className="lender-state-icon">
            !
          </div>

          <h2>
            Unable to load assessment
          </h2>

          <p>{error}</p>
        </section>
      </div>
    )
  }

  return (
    <div className="lender-view">

      <header className="lender-header">

        <div>
          <p className="lender-eyebrow">
            CREDI / LENDER ASSESSMENT
          </p>

          <div className="lender-brand">
            Credi
          </div>

          <p>
            Business Trust Intelligence
          </p>
        </div>

        <div className="lender-header-actions">

          <button
            type="button"
            className="lender-download-button"
            onClick={handleDownloadPdf}
          >
            ↓ Download PDF
          </button>

          <div className="lender-verified">
            <span>✓</span>
            Read-only assessment
          </div>

        </div>

      </header>


      <main className="lender-content">

        {/* Decision summary */}

        <section className="lender-hero">

          <div className="lender-hero-business">

            <p className="lender-label">
              BUSINESS PROFILE
            </p>

            <h1>
              {business?.business_name ||
                business?.name ||
                'Business'}
            </h1>

            <p className="lender-muted">
              {business?.type ||
                'Business information available through Credi'}
            </p>

            {business?.location && (
              <span className="lender-location">
                {business.location}
              </span>
            )}

          </div>

          <div className="lender-hero-score">

            <span>
              Credi Trust Score
            </span>

            <div className="lender-score-number">
              {trustScoreValue ?? '--'}
            </div>

            <small>
              out of 100
            </small>

            <div
              className={`lender-assessment-badge ${trustAssessment.className}`}
            >
              {trustAssessment.label}
            </div>

          </div>

        </section>


        {/* Decision snapshot */}

        <section className="lender-section">

          <div className="lender-section-heading">

            <div>
              <p className="lender-label">
                LENDER SNAPSHOT
              </p>

              <h2>
                Decision-relevant indicators
              </h2>
            </div>

            <span>
              Based on available Credi data
            </span>

          </div>

          <div className="lender-summary-grid">

            <div className="lender-summary-card">
              <span>On-time Payment Rate</span>
              <strong>
                {onTimeRate !== null
                  ? `${onTimeRate}%`
                  : '--'}
              </strong>
              <small>
                {completedWithDates.length}{' '}
                completed payments tracked
              </small>
            </div>

            <div className="lender-summary-card">
              <span>Outstanding Exposure</span>
              <strong>
                {formatAmount(
                  outstandingExposure
                )}
              </strong>
              <small>
                {outstandingTransactions.length}{' '}
                outstanding transaction(s)
              </small>
            </div>

            <div className="lender-summary-card">
              <span>Transaction Activity</span>
              <strong>
                {transactions.length}
              </strong>
              <small>
                Recorded transactions
              </small>
            </div>

            <div className="lender-summary-card">
              <span>Payment Trend</span>
              <strong>
                {relationshipTrend}
              </strong>
              <small>
                Based on available payment history
              </small>
            </div>

          </div>

        </section>


        {/* Financial position */}

        <section className="lender-section">

          <div className="lender-section-heading">

            <div>
              <p className="lender-label">
                FINANCIAL POSITION
              </p>

              <h2>
                Transaction and exposure profile
              </h2>
            </div>

          </div>

          <div className="lender-financial-grid">

            <div className="lender-financial-card">
              <span>
                Total Transaction Value
              </span>

              <strong>
                {formatAmount(
                  totalTransactionValue
                )}
              </strong>

              <small>
                Across all recorded transactions
              </small>
            </div>

            <div className="lender-financial-card">
              <span>
                Outstanding Exposure
              </span>

              <strong>
                {formatAmount(
                  outstandingExposure
                )}
              </strong>

              <small>
                {outstandingPercentage}% of recorded value
              </small>
            </div>

            <div className="lender-financial-card">
              <span>
                Overdue Exposure
              </span>

              <strong>
                {formatAmount(
                  overdueExposure
                )}
              </strong>

              <small>
                {overduePercentage}% of recorded value
              </small>
            </div>

            <div className="lender-financial-card">
              <span>
                Business Relationships
              </span>

              <strong>
                {activeCounterparties}
              </strong>

              <small>
                Active counterparties represented
              </small>
            </div>

          </div>

        </section>


        {/* Trust breakdown */}

        <section className="lender-section">

          <div className="lender-section-heading">

            <div>
              <p className="lender-label">
                TRUST INTELLIGENCE
              </p>

              <h2>
                Trust Score Breakdown
              </h2>
            </div>

            <span>
              Read-only assessment
            </span>

          </div>

          <div className="lender-breakdown">

            <div className="lender-breakdown-item">

              <div>
                <span>
                  Payment Behaviour
                </span>

                <strong>
                  {onTimeRate !== null
                    ? onTimeRate
                    : '--'}
                </strong>
              </div>

              <div className="lender-progress">
                <div
                  style={{
                    width: `${
                      onTimeRate ?? 0
                    }%`
                  }}
                />
              </div>

              <small>
                Based on completed payments
              </small>

            </div>


            <div className="lender-breakdown-item">

              <div>
                <span>
                  Financial Activity
                </span>

                <strong>
                  {transactions.length > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (transactions.length /
                            10) *
                            100
                        )
                      )
                    : '--'}
                </strong>
              </div>

              <div className="lender-progress">
                <div
                  style={{
                    width: `${
                      transactions.length > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (transactions.length /
                                10) *
                                100
                            )
                          )
                        : 0
                    }%`
                  }}
                />
              </div>

              <small>
                Based on recorded transaction activity
              </small>

            </div>


            <div className="lender-breakdown-item">

              <div>
                <span>
                  Business Relationships
                </span>

                <strong>
                  {activeCounterparties > 0
                    ? Math.min(
                        100,
                        activeCounterparties *
                          20
                      )
                    : '--'}
                </strong>
              </div>

              <div className="lender-progress">
                <div
                  style={{
                    width: `${
                      activeCounterparties > 0
                        ? Math.min(
                            100,
                            activeCounterparties *
                              20
                          )
                        : 0
                    }%`
                  }}
                />
              </div>

              <small>
                Based on transaction relationships
              </small>

            </div>


            <div className="lender-breakdown-item">

              <div>
                <span>
                  Verification
                </span>

                <strong>
                  {trustScoreValue !== null
                    ? 'Available'
                    : '--'}
                </strong>
              </div>

              <div className="lender-progress">
                <div
                  style={{
                    width:
                      trustScoreValue !== null
                        ? '100%'
                        : '0%'
                  }}
                />
              </div>

              <small>
                Based on information currently available
              </small>

            </div>

          </div>

        </section>


        {/* Payment performance */}

        <section className="lender-section">

          <div className="lender-section-heading">

            <div>
              <p className="lender-label">
                PAYMENT BEHAVIOUR
              </p>

              <h2>
                Repayment Performance
              </h2>
            </div>

          </div>

          <div className="lender-payment-grid">

            <div>
              <span>
                On-time Payments
              </span>

              <strong>
                {onTimeRate !== null
                  ? `${onTimeRate}%`
                  : '--'}
              </strong>

              <small>
                Completed on or before due date
              </small>
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {paidTransactions.length}
              </strong>

              <small>
                Transactions marked paid
              </small>
            </div>

            <div>
              <span>
                Late Payments
              </span>

              <strong>
                {lateTransactions.length}
              </strong>

              <small>
                Completed after due date
              </small>
            </div>

            <div>
              <span>
                Average Delay
              </span>

              <strong>
                {averagePaymentDelay !== null
                  ? `${averagePaymentDelay}d`
                  : '--'}
              </strong>

              <small>
                Average delay among tracked payments
              </small>
            </div>

          </div>

          <div className="lender-payment-detail">

            <div>
              <span>
                Longest recorded payment delay
              </span>

              <strong>
                {worstPaymentDelay !== null
                  ? `${worstPaymentDelay} days`
                  : 'No data'}
              </strong>
            </div>

            <div>
              <span>
                Outstanding transactions
              </span>

              <strong>
                {outstandingTransactions.length}
              </strong>
            </div>

            <div>
              <span>
                Overdue transactions
              </span>

              <strong>
                {overdueTransactions.length}
              </strong>
            </div>

          </div>

        </section>


        {/* Risk signals */}

        <section className="lender-section">

          <div className="lender-section-heading">

            <div>
              <p className="lender-label">
                RISK REVIEW
              </p>

              <h2>
                Key relationship signals
              </h2>
            </div>

          </div>

          <div className="lender-risk-list">

            {riskFlags.map(
              (flag, index) => (

                <div
                  className={`lender-risk-item ${flag.type}`}
                  key={index}
                >

                  <div className="lender-risk-icon">
                    {flag.icon}
                  </div>

                  <div>
                    <strong>
                      {flag.title}
                    </strong>

                    <p>
                      {flag.description}
                    </p>
                  </div>

                </div>

              )
            )}

          </div>

        </section>


        {/* Transaction evidence */}

        <section className="lender-section lender-evidence-section">

          <div className="lender-section-heading">

            <div>
              <p className="lender-label">
                TRANSACTION EVIDENCE
              </p>

              <h2>
                Recorded payment history
              </h2>
            </div>

            <span>
              {transactions.length} transaction(s)
            </span>

          </div>

          {transactions.length === 0 ? (

            <div className="lender-empty">
              No transaction evidence is currently available.
            </div>

          ) : (

            <div className="lender-table-wrapper">

              <div className="lender-table">

                <div className="lender-table-header">
                  <span>Invoice</span>
                  <span>Amount</span>
                  <span>Due Date</span>
                  <span>Paid Date</span>
                  <span>Delay</span>
                  <span>Status</span>
                </div>

                {transactions.map(
                  (transaction) => {

                    const delay =
                      getPaymentDelay(
                        transaction
                      )

                    return (
                      <div
                        className="lender-table-row"
                        key={transaction.id}
                      >

                        <div>
                          <strong>
                            {transaction.invoice_number ||
                              transaction.invoice_no ||
                              `Transaction ${transaction.id}`}
                          </strong>

                          <small>
                            {transaction.description ||
                              'Recorded business transaction'}
                          </small>
                        </div>

                        <strong>
                          {formatAmount(
                            transaction.amount,
                            transaction.currency ||
                              'INR'
                          )}
                        </strong>

                        <span>
                          {formatDate(
                            transaction.due_date
                          )}
                        </span>

                        <span>
                          {formatDate(
                            transaction.paid_date
                          )}
                        </span>

                        <span>
                          {delay !== null
                            ? `${delay}d`
                            : '—'}
                        </span>

                        <span
                          className={`lender-status ${
                            transaction.status
                              ?.toLowerCase() ===
                            'paid'
                              ? 'paid'
                              : 'pending'
                          }`}
                        >
                          {transaction.status ||
                            'Pending'}
                        </span>

                      </div>
                    )
                  }
                )}

              </div>

            </div>

          )}

        </section>


        {/* Assessment */}

        <section className="lender-assessment">

          <p className="lender-label">
            CREDI ASSESSMENT
          </p>

          <h2>
            Overall Relationship Assessment
          </h2>

          <div className="lender-assessment-content">

            <div className="lender-assessment-score">
              <strong>
                {trustScoreValue ?? '--'}
              </strong>

              <span>
                /100
              </span>
            </div>

            <div>

              <strong className="lender-assessment-title">
                {trustAssessment.label}
              </strong>

              <p>
                The assessment reflects the business
                information, transaction activity and
                payment behaviour currently available
                through Credi.
              </p>

              <p>
                It is intended to support lender due
                diligence and should be considered
                alongside the lender's own underwriting,
                financial and verification procedures.
              </p>

            </div>

          </div>

        </section>


        {/* Verification */}

        <section className="lender-section">

          <div className="lender-section-heading">

            <div>
              <p className="lender-label">
                VERIFICATION
              </p>

              <h2>
                Information Availability
              </h2>
            </div>

          </div>

          <div className="lender-verification">

            <div>
              <span>
                Business Identity
              </span>

              <strong>
                {business
                  ? 'Available'
                  : 'Pending'}
              </strong>
            </div>

            <div>
              <span>
                Business Details
              </span>

              <strong>
                {business
                  ? 'Available'
                  : 'Pending'}
              </strong>
            </div>

            <div>
              <span>
                Transaction Evidence
              </span>

              <strong>
                {transactions.length > 0
                  ? 'Available'
                  : 'Limited'}
              </strong>
            </div>

          </div>

        </section>


        {/* Report information */}

        <section className="lender-footer-info">

          <div>
            <span>
              Report Status
            </span>

            <strong>
              Read-only lender assessment
            </strong>
          </div>

          <div>
            <span>
              Assessment Type
            </span>

            <strong>
              Credi Business Trust Assessment
            </strong>
          </div>

        </section>


        <p className="lender-disclaimer">
          This report is provided to support lender
          due diligence. Credi does not guarantee
          repayment, credit approval or lending
          decisions. Lenders should independently
          verify information and perform their own
          underwriting assessment.
        </p>

      </main>

    </div>
  )
}

export default LenderView