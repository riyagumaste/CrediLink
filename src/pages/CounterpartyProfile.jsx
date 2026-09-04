import { useEffect, useMemo, useState } from 'react'
import './CounterpartyProfile.css'
import { getCounterpartyData } from '../services/counterpartyService'

function CounterpartyProfile() {
  const [counterparties, setCounterparties] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selectedCounterparty, setSelectedCounterparty] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load business relationships and transactions
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

  // Only show transactions for selected counterparty
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

  // Normalize transaction type
  function getTransactionType(transaction) {
    const type = String(
      transaction.transaction_type || ''
    ).toLowerCase()

    if (type === 'inflow' || type === 'receivable') {
      return 'inflow'
    }

    return 'outflow'
  }

  // Normalize transaction status
  function getTransactionStatus(transaction) {
    return String(
      transaction.status || 'pending'
    ).toLowerCase()
  }

  // ---------------------------------------------------------
  // TOTAL HISTORICAL TRANSACTION VALUE
  // ---------------------------------------------------------

  const totalAmount = useMemo(() => {
    return selectedTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )
  }, [selectedTransactions])

  // ---------------------------------------------------------
  // PAID TRANSACTIONS
  // ---------------------------------------------------------

  const paidTransactions = useMemo(() => {
    return selectedTransactions.filter(
      (transaction) =>
        getTransactionStatus(transaction) === 'paid'
    )
  }, [selectedTransactions])

  // ---------------------------------------------------------
  // OUTSTANDING TRANSACTIONS
  // ---------------------------------------------------------

  const outstandingTransactions = useMemo(() => {
    return selectedTransactions.filter(
      (transaction) =>
        getTransactionStatus(transaction) !== 'paid'
    )
  }, [selectedTransactions])

  // ---------------------------------------------------------
  // OUTSTANDING INFLOWS
  // Money still expected FROM the counterparty
  // ---------------------------------------------------------

  const incomingExposure = useMemo(() => {
    return outstandingTransactions
      .filter(
        (transaction) =>
          getTransactionType(transaction) === 'inflow'
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      )
  }, [outstandingTransactions])

  // ---------------------------------------------------------
  // OUTSTANDING OUTFLOWS
  // Money still owed TO the counterparty
  // ---------------------------------------------------------

  const outgoingExposure = useMemo(() => {
    return outstandingTransactions
      .filter(
        (transaction) =>
          getTransactionType(transaction) === 'outflow'
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      )
  }, [outstandingTransactions])

  // ---------------------------------------------------------
  // NET EXPOSURE
  //
  // Positive = more money expected from counterparty
  // Negative = more money owed to counterparty
  // ---------------------------------------------------------

  const netExposure = useMemo(() => {
    return incomingExposure - outgoingExposure
  }, [incomingExposure, outgoingExposure])

  // ---------------------------------------------------------
  // ON-TIME PAYMENT RATE
  //
  // Only completed/paid transactions are evaluated.
  // Pending and overdue transactions are NOT treated
  // as failed payments until they are actually completed.
  // ---------------------------------------------------------

  const completedWithDates = useMemo(() => {
    return paidTransactions.filter(
      (transaction) =>
        transaction.due_date &&
        transaction.paid_date
    )
  }, [paidTransactions])

  const onTimePayments = useMemo(() => {
    return completedWithDates.filter(
      (transaction) => {
        const dueDate = new Date(
          transaction.due_date
        )

        const paidDate = new Date(
          transaction.paid_date
        )

        if (
          Number.isNaN(dueDate.getTime()) ||
          Number.isNaN(paidDate.getTime())
        ) {
          return false
        }

        return paidDate <= dueDate
      }
    )
  }, [completedWithDates])

  const latePayments = useMemo(() => {
    return completedWithDates.filter(
      (transaction) => {
        const dueDate = new Date(
          transaction.due_date
        )

        const paidDate = new Date(
          transaction.paid_date
        )

        if (
          Number.isNaN(dueDate.getTime()) ||
          Number.isNaN(paidDate.getTime())
        ) {
          return false
        }

        return paidDate > dueDate
      }
    )
  }, [completedWithDates])

  const onTimeRate = useMemo(() => {
    if (completedWithDates.length === 0) {
      return null
    }

    return Math.round(
      (onTimePayments.length /
        completedWithDates.length) *
        100
    )
  }, [completedWithDates, onTimePayments])

  // ---------------------------------------------------------
  // DAYS LATE
  // ---------------------------------------------------------

  function getDaysLate(transaction) {
    if (
      !transaction.due_date ||
      !transaction.paid_date
    ) {
      return 0
    }

    const dueDate = new Date(
      transaction.due_date
    )

    const paidDate = new Date(
      transaction.paid_date
    )

    if (
      Number.isNaN(dueDate.getTime()) ||
      Number.isNaN(paidDate.getTime())
    ) {
      return 0
    }

    const difference =
      paidDate.getTime() -
      dueDate.getTime()

    if (difference <= 0) {
      return 0
    }

    return Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    )
  }

  // ---------------------------------------------------------
  // RELATIONSHIP HEALTH
  //
  // Based on completed payment behaviour.
  // Pending transactions do not automatically damage
  // relationship health.
  // ---------------------------------------------------------

  const relationshipHealth = useMemo(() => {
    if (completedWithDates.length === 0) {
      return null
    }

    const totalLateDays =
      completedWithDates.reduce(
        (total, transaction) =>
          total + getDaysLate(transaction),
        0
      )

    const latePaymentPenalty =
      latePayments.length * 5

    const lateDayPenalty =
      totalLateDays * 2

    return Math.max(
      0,
      Math.min(
        100,
        100 -
          latePaymentPenalty -
          lateDayPenalty
      )
    )
  }, [
    completedWithDates,
    latePayments
  ])

  // ---------------------------------------------------------
  // RELATIONSHIP STATUS
  // ---------------------------------------------------------

  const relationshipStatus = useMemo(() => {
    if (relationshipHealth === null) {
      return 'Not enough payment history'
    }

    if (relationshipHealth >= 80) {
      return 'Healthy relationship'
    }

    if (relationshipHealth >= 50) {
      return 'Monitor closely'
    }

    return 'Needs attention'
  }, [relationshipHealth])

  // ---------------------------------------------------------
  // FORMAT CURRENCY
  // ---------------------------------------------------------

  function formatAmount(
    amount,
    currency = 'INR'
  ) {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }
    ).format(Number(amount || 0))
  }

  // ---------------------------------------------------------
  // FORMAT DATE
  // ---------------------------------------------------------

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
        year: 'numeric',
      }
    )
  }

  // ---------------------------------------------------------
  // INITIALS
  // ---------------------------------------------------------

  function getInitials(name) {
    if (!name) {
      return '?'
    }

    const words =
      name.trim().split(/\s+/)

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase()
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase()
  }

  // ---------------------------------------------------------
  // STATUS CSS
  // ---------------------------------------------------------

  function getStatusClass(status) {
    const normalizedStatus = (
      status || 'pending'
    ).toLowerCase()

    if (
      normalizedStatus === 'paid'
    ) {
      return 'status-paid'
    }

    if (
      normalizedStatus === 'overdue'
    ) {
      return 'status-overdue'
    }

    return 'status-pending'
  }

  // ---------------------------------------------------------
  // COUNTERPARTY SELECTOR
  // ---------------------------------------------------------

  function handleCounterpartyChange(e) {
    const selectedId =
      e.target.value

    const selected =
      counterparties.find(
        (counterparty) =>
          String(counterparty.id) ===
          String(selectedId)
      )

    setSelectedCounterparty(
      selected || null
    )
  }

  return (
    <div className="counterparty-page">

      {/* HEADER */}

      <header className="counterparty-header">

        <div className="header-content">

          <p className="eyebrow">
            CREDI / BUSINESS NETWORK
          </p>

          <h1>
            Counterparty Profile
          </h1>

          <p className="header-description">
            Analyse businesses you transact
            with and monitor their payment
            relationships.
          </p>

        </div>

        <div className="verified-badge">

          <span className="verified-dot" />

          Relationship Monitor

        </div>

      </header>


      {/* LOADING */}

      {loading && (
        <section className="state-card">

          <div className="loading-spinner" />

          <h2>
            Loading counterparties
          </h2>

          <p>
            Retrieving your business
            relationships...
          </p>

        </section>
      )}


      {/* ERROR */}

      {!loading && error && (
        <section className="state-card error-state">

          <div className="state-icon">
            !
          </div>

          <h2>
            Unable to load data
          </h2>

          <p>
            {error}
          </p>

        </section>
      )}


      {/* NO COUNTERPARTIES */}

      {!loading &&
        !error &&
        counterparties.length === 0 && (
          <section className="state-card">

            <div className="state-icon">
              —
            </div>

            <h2>
              No counterparties found
            </h2>

            <p>
              Add counterparties to your
              business to begin tracking
              transaction relationships.
            </p>

          </section>
        )}


      {/* MAIN CONTENT */}

      {!loading &&
        !error &&
        selectedCounterparty && (
          <>

            {/* SELECT COUNTERPARTY */}

            <section className="selector-card">

              <div className="selector-copy">

                <span className="section-label">
                  COUNTERPARTY
                </span>

                <h2>
                  Select a business
                  relationship
                </h2>

              </div>

              <div className="counterparty-select-wrapper">

                <select
                  value={
                    selectedCounterparty.id
                  }
                  onChange={
                    handleCounterpartyChange
                  }
                  aria-label="Select counterparty"
                >

                  {counterparties.map(
                    (counterparty) => (
                      <option
                        key={
                          counterparty.id
                        }
                        value={
                          counterparty.id
                        }
                      >
                        {
                          counterparty.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

            </section>


            {/* BUSINESS PROFILE */}

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
                  {
                    selectedCounterparty.name
                  }
                </h2>

                <p>
                  {
                    selectedCounterparty.industry ||
                    'Industry information unavailable'
                  }
                </p>

              </div>

              <div className="relationship">

                <span>
                  Trust Level
                </span>

                <strong>
                  {
                    selectedCounterparty.trust_level ||
                    'Not Rated'
                  }
                </strong>

              </div>

            </section>


            {/* CONTACT */}

            <section className="contact-grid">

              <div className="counterparty-card contact-card">

                <span className="contact-label">
                  EMAIL
                </span>

                <strong>
                  {
                    selectedCounterparty.email ||
                    'Not available'
                  }
                </strong>

              </div>


              <div className="counterparty-card contact-card">

                <span className="contact-label">
                  PHONE
                </span>

                <strong>
                  {
                    selectedCounterparty.phone ||
                    'Not available'
                  }
                </strong>

              </div>


              <div className="counterparty-card contact-card">

                <span className="contact-label">
                  BUSINESS TYPE
                </span>

                <strong>
                  {
                    selectedCounterparty.type ||
                    'Not available'
                  }
                </strong>

              </div>

            </section>


            {/* FINANCIAL OVERVIEW */}

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

                {/* TOTAL */}

                <div className="counterparty-card stat-card">

                  <p>
                    Total Transaction Value
                  </p>

                  <strong>
                    {formatAmount(
                      totalAmount
                    )}
                  </strong>

                  <span>
                    Across all recorded
                    transactions
                  </span>

                </div>


                {/* OUTSTANDING */}

                <div className="counterparty-card stat-card">

                  <p>
                    Outstanding Exposure
                  </p>

                  <strong>
                    {formatAmount(
                      incomingExposure +
                        outgoingExposure
                    )}
                  </strong>

                  <span>
                    {
                      outstandingTransactions.length
                    }{' '}
                    outstanding transaction
                    {
                      outstandingTransactions.length !==
                      1
                        ? 's'
                        : ''
                    }
                  </span>

                </div>


                {/* NET EXPOSURE */}

                <div className="counterparty-card stat-card">

                  <p>
                    Net Exposure
                  </p>

                  <strong>
                    {netExposure > 0
                      ? '+'
                      : ''}
                    {formatAmount(
                      netExposure
                    )}
                  </strong>

                  <span>
                    {netExposure > 0
                      ? 'Net amount expected in'
                      : netExposure < 0
                        ? 'Net amount expected out'
                        : 'No current net exposure'}
                  </span>

                </div>


                {/* ON TIME */}

                <div className="counterparty-card stat-card">

                  <p>
                    On-Time Payment Rate
                  </p>

                  <strong>
                    {onTimeRate === null
                      ? '--'
                      : `${onTimeRate}%`}
                  </strong>

                  <span>
                    {completedWithDates.length >
                    0
                      ? `${onTimePayments.length} of ${completedWithDates.length} completed payments on time`
                      : 'No completed payment history'}
                  </span>

                </div>


                {/* INCOMING */}

                <div className="counterparty-card stat-card">

                  <p>
                    Incoming Exposure
                  </p>

                  <strong>
                    {formatAmount(
                      incomingExposure
                    )}
                  </strong>

                  <span>
                    Outstanding receivables
                  </span>

                </div>


                {/* OUTGOING */}

                <div className="counterparty-card stat-card">

                  <p>
                    Outgoing Exposure
                  </p>

                  <strong>
                    {formatAmount(
                      outgoingExposure
                    )}
                  </strong>

                  <span>
                    Outstanding payables
                  </span>

                </div>

              </div>

            </section>


            {/* TRANSACTION HISTORY */}

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
                  {
                    selectedTransactions.length
                  }{' '}
                  transaction
                  {
                    selectedTransactions.length !==
                    1
                      ? 's'
                      : ''
                  }
                </span>

              </div>


              {selectedTransactions.length ===
              0 ? (

                <div className="empty-transactions">

                  <span>
                    —
                  </span>

                  <p>
                    No transactions found
                    with this counterparty.
                  </p>

                </div>

              ) : (

                <div className="transaction-table-wrapper">

                  <div className="transaction-table">

                    {/* TABLE HEADER */}

                    <div className="table-header">

                      <span>
                        Invoice
                      </span>

                      <span>
                        Type
                      </span>

                      <span>
                        Amount
                      </span>

                      <span>
                        Due Date
                      </span>

                      <span>
                        Paid Date
                      </span>

                      <span>
                        Status
                      </span>

                    </div>


                    {/* TRANSACTIONS */}

                    {selectedTransactions.map(
                      (transaction) => {

                        const status =
                          getTransactionStatus(
                            transaction
                          )

                        const type =
                          getTransactionType(
                            transaction
                          )

                        return (

                          <div
                            className="table-row"
                            key={
                              transaction.id
                            }
                          >

                            {/* INVOICE */}

                            <div className="invoice-cell">

                              <strong>
                                {
                                  transaction.invoice_number ||
                                  'Transaction'
                                }
                              </strong>

                              <span>
                                {
                                  transaction.description ||
                                  'No description'
                                }
                              </span>

                            </div>


                            {/* TYPE */}

                            <span className="transaction-type">

                              {type ===
                              'inflow'
                                ? 'Inflow'
                                : 'Outflow'}

                            </span>


                            {/* AMOUNT */}

                            <strong className="transaction-amount">

                              {formatAmount(
                                transaction.amount,
                                transaction.currency ||
                                  'INR'
                              )}

                            </strong>


                            {/* DUE DATE */}

                            <span className="transaction-date">

                              {formatDate(
                                transaction.due_date
                              )}

                            </span>


                            {/* PAID DATE */}

                            <span className="transaction-date">

                              {status ===
                                'paid' &&
                              transaction.paid_date
                                ? formatDate(
                                    transaction.paid_date
                                  )
                                : '—'}

                            </span>


                            {/* STATUS */}

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
                      }
                    )}

                  </div>

                </div>

              )}

            </section>


            {/* PAYMENT ANALYSIS */}

            <section className="analysis-grid">

              <div className="counterparty-card analysis-card">

                <span className="section-label">
                  PAYMENT BEHAVIOUR
                </span>

                <h2>
                  Relationship signals
                </h2>

                <div className="analysis-list">

                  {/* COMPLETED */}

                  <div className="analysis-item">

                    <div className="analysis-icon positive">
                      ✓
                    </div>

                    <div>

                      <strong>
                        {
                          paidTransactions.length
                        }{' '}
                        completed
                      </strong>

                      <p>
                        Transactions marked
                        as paid.
                      </p>

                    </div>

                  </div>


                  {/* OUTSTANDING */}

                  <div className="analysis-item">

                    <div className="analysis-icon warning">
                      !
                    </div>

                    <div>

                      <strong>
                        {
                          outstandingTransactions.length
                        }{' '}
                        outstanding
                      </strong>

                      <p>
                        Transactions still
                        awaiting payment.
                      </p>

                    </div>

                  </div>


                  {/* PAYMENT BEHAVIOUR */}

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
                          ? 'More completed payments are required to evaluate payment behaviour.'
                          : `${onTimePayments.length} of ${completedWithDates.length} completed payments were made on time.`}

                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* RELATIONSHIP HEALTH */}

              <div className="counterparty-card score-card">

                <span className="section-label">
                  RELATIONSHIP HEALTH
                </span>

                <div className="score-display">

                  <strong>
                    {relationshipHealth ===
                    null
                      ? '--'
                      : relationshipHealth}
                  </strong>

                  {relationshipHealth !==
                    null && (
                    <span>
                      /100
                    </span>
                  )}

                </div>

                <div className="score-status">
                  {relationshipStatus}
                </div>

                <p>

                  This indicator reflects
                  completed payment behaviour.
                  Late payments reduce the
                  relationship health score,
                  while pending transactions
                  are not treated as failed
                  payments until they are
                  completed.

                </p>

              </div>

            </section>

          </>
        )}

    </div>
  )
}

export default CounterpartyProfile