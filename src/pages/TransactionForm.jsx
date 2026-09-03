import { useState } from 'react'
import './TransactionForm.css'

function TransactionForm() {
  const [formData, setFormData] = useState({
    counterparty: '',
    transactionType: 'Receivable',
    amount: '',
    transactionDate: '',
    dueDate: '',
    description: '',
  })

  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setSubmitted(false)
  }

  function handleSubmit(event) {
    event.preventDefault()

    setSubmitted(true)

    console.log('Transaction submitted:', formData)
  }

  return (
    <div className="transaction-page">

      {/* HEADER */}

      <header className="transaction-header">

        <div>
          <p className="eyebrow">CREDI / TRANSACTION DATA</p>

          <h1>Add Transaction</h1>

          <p>
            Record a business transaction to keep your financial
            activity and payment history up to date.
          </p>
        </div>

        <div className="transaction-badge">
          <span>Data Status</span>
          <strong>Manual Entry</strong>
        </div>

      </header>


      {/* FORM */}

      <section className="transaction-card">

        <div className="form-heading">

          <div>
            <p className="section-label">TRANSACTION DETAILS</p>
            <h2>Enter transaction information</h2>
          </div>

          <span>All required fields should be completed</span>

        </div>


        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            {/* COUNTERPARTY */}

            <div className="form-group full-width">

              <label htmlFor="counterparty">
                Counterparty
              </label>

              <input
                id="counterparty"
                name="counterparty"
                type="text"
                placeholder="e.g. Northstar Supplies"
                value={formData.counterparty}
                onChange={handleChange}
                required
              />

            </div>


            {/* TRANSACTION TYPE */}

            <div className="form-group">

              <label htmlFor="transactionType">
                Transaction Type
              </label>

              <select
                id="transactionType"
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
              >
                <option value="Receivable">
                  Receivable
                </option>

                <option value="Payable">
                  Payable
                </option>
              </select>

            </div>


            {/* AMOUNT */}

            <div className="form-group">

              <label htmlFor="amount">
                Amount
              </label>

              <div className="amount-input">

                <span>₹</span>

                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* TRANSACTION DATE */}

            <div className="form-group">

              <label htmlFor="transactionDate">
                Transaction Date
              </label>

              <input
                id="transactionDate"
                name="transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={handleChange}
                required
              />

            </div>


            {/* DUE DATE */}

            <div className="form-group">

              <label htmlFor="dueDate">
                Due Date
              </label>

              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />

            </div>


            {/* DESCRIPTION */}

            <div className="form-group full-width">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="Add any relevant transaction details..."
                value={formData.description}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* INFORMATION NOTE */}

          <div className="transaction-info">

            <div className="info-icon">
              i
            </div>

            <p>
              Transaction information will be used by Credi to
              analyse payment behaviour, cash flow and business
              exposure once backend processing is connected.
            </p>

          </div>


          {/* ACTIONS */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setFormData({
                  counterparty: '',
                  transactionType: 'Receivable',
                  amount: '',
                  transactionDate: '',
                  dueDate: '',
                  description: '',
                })

                setSubmitted(false)
              }}
            >
              Clear
            </button>

            <button
              type="submit"
              className="submit-button"
            >
              Save Transaction
            </button>

          </div>


          {submitted && (

            <div className="success-message">

              <span>✓</span>

              <div>
                <strong>Transaction captured</strong>

                <p>
                  The transaction has been captured locally.
                  Backend persistence will be connected later.
                </p>
              </div>

            </div>

          )}

        </form>

      </section>

    </div>
  )
}

export default TransactionForm