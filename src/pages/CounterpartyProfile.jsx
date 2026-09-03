import { useEffect, useState } from 'react'
import './CounterpartyProfile.css'
import { getCounterpartyData } from '../services/counterpartyService'

function CounterpartyProfile() {
  const [counterparties, setCounterparties] = useState([])
  const [transactions, setTransactions] = useState([])
  const [selectedCounterparty, setSelectedCounterparty] =
    useState(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCounterpartyData()

        setCounterparties(data.counterparties)
        setTransactions(data.transactions)

        if (data.counterparties.length > 0) {
          setSelectedCounterparty(data.counterparties[0])
        }

      } catch (error) {
        console.error(
          'Counterparty loading error:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])


  // Transactions belonging to selected counterparty

  const selectedTransactions =
    selectedCounterparty
      ? transactions.filter(
          (transaction) =>
            transaction.counterparty_id ===
            selectedCounterparty.id
        )
      : []


  // Total transaction amount

  const totalAmount =
    selectedTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )


  // Paid transactions

  const paidTransactions =
    selectedTransactions.filter(
      (transaction) =>
        transaction.status === 'paid'
    )


  // Outstanding transactions

  const outstandingTransactions =
    selectedTransactions.filter(
      (transaction) =>
        transaction.status !== 'paid'
    )


  const outstandingAmount =
    outstandingTransactions.reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    )


  // Payment behaviour

  const completedWithDates =
    paidTransactions.filter(
      (transaction) =>
        transaction.due_date &&
        transaction.paid_date
    )


  const onTimePayments =
    completedWithDates.filter(
      (transaction) =>
        new Date(transaction.paid_date) <=
        new Date(transaction.due_date)
    )


  const onTimeRate =
    completedWithDates.length > 0
      ? Math.round(
          (onTimePayments.length /
            completedWithDates.length) *
            100
        )
      : null


  function formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount || 0))
  }


  return (
    <div className="counterparty-page">

      {/* HEADER */}

      <header className="counterparty-header">

        <div>

          <p className="eyebrow">
            CREDI / BUSINESS NETWORK
          </p>

          <h1>Counterparty Profile</h1>

          <p>
            Analyse businesses you transact with and monitor
            their payment relationships.
          </p>

        </div>

      </header>


      {/* COUNTERPARTY SELECTOR */}

      <section className="counterparty-selector">

        <label>Select Counterparty</label>

        <select
          value={selectedCounterparty?.id || ''}
          onChange={(e) => {

            const selected =
              counterparties.find(
                (counterparty) =>
                  counterparty.id === e.target.value
              )

            setSelectedCounterparty(selected)

          }}
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

      </section>


      {/* LOADING */}

      {loading && (
        <p className="loading-message">
          Loading counterparties...
        </p>
      )}


      {/* NO COUNTERPARTIES */}

      {!loading && counterparties.length === 0 && (

        <section className="empty-state">

          <h2>No counterparties found</h2>

          <p>
            Add counterparties to your business to begin
            tracking relationships.
          </p>

        </section>

      )}


      {/* PROFILE */}

      {!loading && selectedCounterparty && (

        <>

          {/* BUSINESS INFORMATION */}

          <section className="counterparty-info">

            <div>

              <p className="section-label">
                BUSINESS PROFILE
              </p>

              <h2>
                {selectedCounterparty.name}
              </h2>

              <p>
                {selectedCounterparty.industry ||
                  'Industry information unavailable'}
              </p>

            </div>


            <div className="trust-level">

              <span>Trust Level</span>

              <strong>
                {selectedCounterparty.trust_level ||
                  'Not Rated'}
              </strong>

            </div>

          </section>


          {/* CONTACT INFORMATION */}

          <section className="contact-grid">

            <div className="contact-card">

              <p>Email</p>

              <strong>
                {selectedCounterparty.email ||
                  'Not available'}
              </strong>

            </div>


            <div className="contact-card">

              <p>Phone</p>

              <strong>
                {selectedCounterparty.phone ||
                  'Not available'}
              </strong>

            </div>


            <div className="contact-card">

              <p>Business Type</p>

              <strong>
                {selectedCounterparty.type ||
                  'Not available'}
              </strong>

            </div>

          </section>


          {/* FINANCIAL STATS */}

          <section className="counterparty-stats">

            <div className="stat-card">

              <p>Total Transaction Value</p>

              <strong>
                {formatAmount(totalAmount)}
              </strong>

            </div>


            <div className="stat-card">

              <p>Outstanding Exposure</p>

              <strong>
                {formatAmount(outstandingAmount)}
              </strong>

            </div>


            <div className="stat-card">

              <p>On-Time Payment Rate</p>

              <strong>
                {onTimeRate === null
                  ? '--'
                  : `${onTimeRate}%`}
              </strong>

            </div>

          </section>


          {/* TRANSACTION HISTORY */}

          <section className="transaction-history">

            <div className="section-heading">

              <div>

                <p className="section-label">
                  RELATIONSHIP HISTORY
                </p>

                <h2>
                  Transaction History
                </h2>

              </div>

              <span>
                {selectedTransactions.length}
                {' '}
                Transaction
                {selectedTransactions.length !== 1
                  ? 's'
                  : ''}
              </span>

            </div>


            {selectedTransactions.length === 0 && (

              <p>
                No transactions found with this
                counterparty.
              </p>

            )}


            {selectedTransactions.map(
              (transaction) => (

                <div
                  className="transaction-row"
                  key={transaction.id}
                >

                  <div>

                    <strong>
                      {transaction.invoice_number ||
                        'Transaction'}
                    </strong>

                    <span>
                      {transaction.description ||
                        'No description'}
                    </span>

                  </div>


                  <div>

                    <strong>
                      {formatAmount(transaction.amount)}
                    </strong>

                    <span>
                      {transaction.transaction_type}
                    </span>

                  </div>


                  <span
                    className={`status-${transaction.status}`}
                  >
                    {transaction.status}
                  </span>

                </div>

              )
            )}

          </section>

        </>

      )}

    </div>
  )
}

export default CounterpartyProfile