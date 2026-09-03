import { useEffect, useMemo, useState } from 'react'
import './CounterpartyProfile.css'
import { getCounterpartyData } from '../services/counterpartyService'

function CounterpartyProfile() {
  const [counterparties, setCounterparties] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selectedCounterparty, setSelectedCounterparty] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // LOAD DATA

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const data = await getCounterpartyData()

        const loadedCounterparties = data?.counterparties || []
        const loadedTransactions = data?.transactions || []

        setCounterparties(loadedCounterparties)
        setTransactions(loadedTransactions)

        if (loadedCounterparties.length > 0) {
          setSelectedCounterparty(loadedCounterparties[0])
        }
      } catch (error) {
        console.error('Counterparty loading error:', error)
        setError(
          error.message || 'Unable to load counterparty data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // SELECTED TRANSACTIONS

  const selectedTransactions = useMemo(() => {
    if (!selectedCounterparty) {
      return []
    }

    return transactions.filter(
      (transaction) =>
        String(transaction.counterparty_id) ===
        String(selectedCounterparty.id)
    )
  }, [transactions, selectedCounterparty])

  // =========================================
  // FINANCIAL CALCULATIONS
  // =========================================

  const totalAmount = useMemo(() => {
    return selectedTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )
  }, [selectedTransactions])

  const paidTransactions = useMemo(() => {
    return selectedTransactions.filter(
      (transaction) => transaction.status === 'paid'
    )
  }, [selectedTransactions])

  const outstandingTransactions = useMemo(() => {
    return selectedTransactions.filter(
      (transaction) => transaction.status !== 'paid'
    )
  }, [selectedTransactions])

  const outstandingAmount = useMemo(() => {
    return outstandingTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )
  }, [outstandingTransactions])

  // =========================================
  // PAYMENT BEHAVIOUR
  // =========================================

  const completedWithDates = useMemo(() => {
    return paidTransactions.filter(
      (transaction) =>
        transaction.due_date &&
        transaction.paid_date
    )
  }, [paidTransactions])

  const onTimePayments = useMemo(() => {
    return completedWithDates.filter(
      (transaction) =>
        new Date(transaction.paid_date) <=
        new Date(transaction.due_date)
    )
  }, [completedWithDates])

  const onTimeRate =
    completedWithDates.length > 0
      ? Math.round(
          (onTimePayments.length /
            completedWithDates.length) *
            100
        )
      : null

  // =========================================
  // HELPERS
  // =========================================

  function formatAmount(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0))
  }

  function formatDate(date) {
    if (!date) {
      return '—'
    }

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return '—'
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  function getInitials(name) {
    if (!name) {
      return '?'
    }

    const words = name.trim().split(/\s+/)

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase()
  }

  function getStatusClass(status) {
    const normalizedStatus = (
      status || 'pending'
    ).toLowerCase()

    if (normalizedStatus === 'paid') {
      return 'status-paid'
    }

    if (normalizedStatus === 'overdue') {
      return 'status-overdue'
    }

    return 'status-pending'
  }

  function handleCounterpartyChange(e) {
    const selectedId = e.target.value

    const selected = counterparties.find(
      (counterparty) =>
        String(counterparty.id) === String(selectedId)
    )

    setSelectedCounterparty(selected || null)
  }

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="counterparty-page">

      {/* =====================================
          HEADER
          ===================================== */}

      <header className="counterparty-header">

        <div className="header-content">

          <p className="eyebrow">
            CREDI / BUSINESS NETWORK
          </p>

          <h1>Counterparty Profile</h1>

          <p className="header-description">
            Analyse businesses you transact with and
            monitor their payment relationships.
          </p>

        </div>

        <div className="verified-badge">
          <span className="verified-dot" />
          Relationship Monitor
        </div>

      </header>


      {/* =====================================
          LOADING
          ===================================== */}

      {loading && (
        <section className="state-card">
          <div className="loading-spinner" />

          <h2>Loading counterparties</h2>

          <p>
            Retrieving your business relationships...
          </p>
        </section>
      )}


      {/* =====================================
          ERROR
          ===================================== */}

      {!loading && error && (
        <section className="state-card error-state">

          <div className="state-icon">
            !
          </div>

          <h2>Unable to load data</h2>

          <p>{error}</p>

        </section>
      )}


      {/* =====================================
          EMPTY
          ===================================== */}

      {!loading &&
        !error &&
        counterparties.length === 0 && (
          <section className="state-card">

            <div className="state-icon">
              —
            </div>

            <h2>No counterparties found</h2>

            <p>
              Add counterparties to your business to begin
              tracking transaction relationships.
            </p>

          </section>
        )}


      {/* =====================================
          MAIN CONTENT
          ===================================== */}

      {!loading &&
        !error &&
        selectedCounterparty && (
          <>

            {/* =================================
                SELECTOR
                ================================= */}

            <section className="selector-card">

              <div className="selector-copy">
                <span className="section-label">
                  COUNTERPARTY
                </span>

                <h2>
                  Select a business relationship
                </h2>
              </div>

              <div className="counterparty-select-wrapper">

                <select
                  value={selectedCounterparty.id}
                  onChange={handleCounterpartyChange}
                  aria-label="Select counterparty"
                >

                  {counterparties.map(
                    (counterparty) => (
                      <option
                        key={counterparty.id}
                        value={counterparty.id}
                      >
                        {counterparty.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </section>


            {/* =================================
                BUSINESS PROFILE
                ================================= */}

            <section className="counterparty-card identity-card">

              <div className="company-avatar">
                {getInitials(
                  selectedCounterparty.name
                )}
              </div>

              <div className="company-info">

                <span className="section-label">
                  BUSINESS PROFILE
                </span>

                <h2>
                  {selectedCounterparty.name}
                </h2>

                <p>
                  {selectedCounterparty.industry ||
                    'Industry information unavailable'}
                </p>

              </div>

              <div className="relationship">

                <span>
                  Trust Level
                </span>

                <strong>
                  {selectedCounterparty.trust_level ||
                    'Not Rated'}
                </strong>

              </div>

            </section>


            {/* =================================
                CONTACT INFORMATION
                ================================= */}

            <section className="contact-grid">

              <div className="counterparty-card contact-card">

                <span className="contact-label">
                  EMAIL
                </span>

                <strong>
                  {selectedCounterparty.email ||
                    'Not available'}
                </strong>

              </div>


              <div className="counterparty-card contact-card">

                <span className="contact-label">
                  PHONE
                </span>

                <strong>
                  {selectedCounterparty.phone ||
                    'Not available'}
                </strong>

              </div>


              <div className="counterparty-card contact-card">

                <span className="contact-label">
                  BUSINESS TYPE
                </span>

                <strong>
                  {selectedCounterparty.type ||
                    'Not available'}
                </strong>

              </div>

            </section>


            {/* =================================
                FINANCIAL OVERVIEW
                ================================= */}

            <section className="financial-section">

              <div className="section-heading">

                <div>
                  <span className="section-label">
                    FINANCIAL OVERVIEW
                  </span>

                  <h2>
                    Relationship summary
                  </h2>
                </div>

              </div>


              <div className="counterparty-stats">

                <div className="counterparty-card stat-card">

                  <p>Total Transaction Value</p>

                  <strong>
                    {formatAmount(totalAmount)}
                  </strong>

                  <span>
                    Across all recorded transactions
                  </span>

                </div>


                <div className="counterparty-card stat-card">

                  <p>Outstanding Exposure</p>

                  <strong>
                    {formatAmount(outstandingAmount)}
                  </strong>

                  <span>
                    {outstandingTransactions.length}{' '}
                    outstanding transaction
                    {outstandingTransactions.length !== 1
                      ? 's'
                      : ''}
                  </span>

                </div>


                <div className="counterparty-card stat-card">

                  <p>On-Time Payment Rate</p>

                  <strong>
                    {onTimeRate === null
                      ? '--'
                      : `${onTimeRate}%`}
                  </strong>

                  <span>
                    {completedWithDates.length > 0
                      ? `${onTimePayments.length} of ${completedWithDates.length} paid on time`
                      : 'Insufficient payment history'}
                  </span>

                </div>

              </div>

            </section>


            {/* =================================
                TRANSACTION HISTORY
                ================================= */}

            <section className="counterparty-card transaction-history">

              <div className="section-heading">

                <div>
                  <span className="section-label">
                    RELATIONSHIP HISTORY
                  </span>

                  <h2>
                    Transaction History
                  </h2>
                </div>

                <span className="transaction-count">
                  {selectedTransactions.length}{' '}
                  transaction
                  {selectedTransactions.length !== 1
                    ? 's'
                    : ''}
                </span>

              </div>


              {selectedTransactions.length === 0 ? (

                <div className="empty-transactions">

                  <span>—</span>

                  <p>
                    No transactions found with this
                    counterparty.
                  </p>

                </div>

              ) : (

                <div className="transaction-table-wrapper">

                  <div className="transaction-table">

                    {/* TABLE HEADER */}

                    <div className="table-header">

                      <span>Invoice</span>
                      <span>Type</span>
                      <span>Amount</span>
                      <span>Due Date</span>
                      <span>Status</span>

                    </div>


                    {/* TABLE ROWS */}

                    {selectedTransactions.map(
                      (transaction) => (

                        <div
                          className="table-row"
                          key={transaction.id}
                        >

                          <div className="invoice-cell">

                            <strong>
                              {transaction.invoice_number ||
                                'Transaction'}
                            </strong>

                            <span>
                              {transaction.description ||
                                'No description'}
                            </span>

                          </div>


                          <span className="transaction-type">
                            {transaction.transaction_type ===
                            'inflow'
                              ? 'Inflow'
                              : 'Outflow'}
                          </span>


                          <strong className="transaction-amount">
                            {formatAmount(
                              transaction.amount,
                              transaction.currency || 'INR'
                            )}
                          </strong>


                          <span className="transaction-date">
                            {formatDate(
                              transaction.due_date
                            )}
                          </span>


                          <span
                            className={`status-badge ${getStatusClass(
                              transaction.status
                            )}`}
                          >
                            {transaction.status ||
                              'Pending'}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            </section>


            {/* =================================
                PAYMENT ANALYSIS
                ================================= */}

            <section className="analysis-grid">

              <div className="counterparty-card analysis-card">

                <span className="section-label">
                  PAYMENT BEHAVIOUR
                </span>

                <h2>
                  Relationship signals
                </h2>


                <div className="analysis-list">

                  <div className="analysis-item">

                    <div className="analysis-icon positive">
                      ✓
                    </div>

                    <div>

                      <strong>
                        {paidTransactions.length}{' '}
                        completed
                      </strong>

                      <p>
                        Transactions marked as paid.
                      </p>

                    </div>

                  </div>


                  <div className="analysis-item">

                    <div className="analysis-icon warning">
                      !
                    </div>

                    <div>

                      <strong>
                        {outstandingTransactions.length}{' '}
                        outstanding
                      </strong>

                      <p>
                        Transactions still awaiting
                        payment.
                      </p>

                    </div>

                  </div>


                  <div className="analysis-item">

                    <div
                      className={`analysis-icon ${
                        onTimeRate !== null &&
                        onTimeRate >= 80
                          ? 'positive'
                          : 'warning'
                      }`}
                    >
                      {onTimeRate !== null &&
                      onTimeRate >= 80
                        ? '✓'
                        : '!'}
                    </div>

                    <div>

                      <strong>
                        {onTimeRate === null
                          ? 'Payment history unavailable'
                          : onTimeRate >= 80
                            ? 'Strong payment behaviour'
                            : 'Payment behaviour needs attention'}
                      </strong>

                      <p>
                        {onTimeRate === null
                          ? 'More completed transactions with due dates are required.'
                          : `${onTimeRate}% of tracked payments were completed on time.`}
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* SCORE / SUMMARY */}

              <div className="counterparty-card score-card">

                <span className="section-label">
                  RELATIONSHIP HEALTH
                </span>

                <div className="score-display">

                  <strong>
                    {onTimeRate === null
                      ? '--'
                      : onTimeRate}
                  </strong>

                  {onTimeRate !== null && (
                    <span>/100</span>
                  )}

                </div>

                <div className="score-status">

                  {onTimeRate === null
                    ? 'Not enough data'
                    : onTimeRate >= 80
                      ? 'Healthy relationship'
                      : onTimeRate >= 50
                        ? 'Monitor closely'
                        : 'Needs attention'}

                </div>

                <p>
                  This indicator is based on available
                  transaction payment history and should
                  be treated as a relationship signal,
                  not a formal credit score.
                </p>

              </div>

            </section>

          </>
        )}

    </div>
  )
}

export default CounterpartyProfile
