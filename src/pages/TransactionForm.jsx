import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './TransactionForm.css'

function TransactionForm() {
  const [businesses, setBusinesses] = useState([])
  const [counterparties, setCounterparties] = useState([])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    business_id: '',
    counterparty_id: '',
    transaction_type: 'outflow',
    amount: '',
    currency: 'INR',
    invoice_number: '',
    issue_date: '',
    due_date: '',
    paid_date: '',
    status: 'pending',
    description: '',
  })


  // Load businesses
  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('business_name')

      if (error) {
        console.error(error)
        return
      }

      setBusinesses(data || [])
    }

    loadBusinesses()
  }, [])


  // Load counterparties when business changes
  useEffect(() => {
    async function loadCounterparties() {

      if (!formData.business_id) {
        setCounterparties([])
        return
      }

      const { data, error } = await supabase
        .from('counterparties')
        .select('*')
        .eq('business_id', formData.business_id)
        .order('name')

      if (error) {
        console.error(error)
        return
      }

      setCounterparties(data || [])
    }

    loadCounterparties()
  }, [formData.business_id])


  function handleChange(e) {
    const { name, value } = e.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }


  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true)
    setMessage('')

    try {
      const transactionData = {
        business_id: formData.business_id,
        counterparty_id: formData.counterparty_id || null,
        transaction_type: formData.transaction_type,
        amount: Number(formData.amount),
        currency: formData.currency,
        invoice_number: formData.invoice_number || null,
        issue_date: formData.issue_date || null,
        due_date: formData.due_date || null,
        paid_date: formData.paid_date || null,
        status: formData.status,
        description: formData.description || null,
      }

      const { error } = await supabase
        .from('transactions')
        .insert([transactionData])

      if (error) {
        throw error
      }

      setMessage('Transaction added successfully!')

      setFormData({
        business_id: '',
        counterparty_id: '',
        transaction_type: 'outflow',
        amount: '',
        currency: 'INR',
        invoice_number: '',
        issue_date: '',
        due_date: '',
        paid_date: '',
        status: 'pending',
        description: '',
      })

    } catch (error) {

      console.error('Transaction error:', error)

      setMessage(`Error: ${error.message}`)

    } finally {

      setLoading(false)

    }
  }


  return (
    <div className="transaction-page">

      <header className="transaction-header">

        <div>
          <p className="eyebrow">
            CREDI / TRANSACTION MANAGEMENT
          </p>

          <h1>Add Transaction</h1>

          <p>
            Record a business transaction to update your financial insights.
          </p>
        </div>

      </header>


      <section className="transaction-form-container">

        <form onSubmit={handleSubmit} className="transaction-form">

          {/* BUSINESS */}

          <div className="form-group">

            <label>Your Business</label>

            <select
              name="business_id"
              value={formData.business_id}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Business
              </option>

              {businesses.map((business) => (

                <option
                  key={business.id}
                  value={business.id}
                >
                  {business.business_name}
                </option>

              ))}

            </select>

          </div>


          {/* COUNTERPARTY */}

          <div className="form-group">

            <label>Counterparty</label>

            <select
              name="counterparty_id"
              value={formData.counterparty_id}
              onChange={handleChange}
            >

              <option value="">
                Select Counterparty
              </option>

              {counterparties.map((counterparty) => (

                <option
                  key={counterparty.id}
                  value={counterparty.id}
                >
                  {counterparty.name}
                </option>

              ))}

            </select>

          </div>


          {/* TRANSACTION TYPE */}

          <div className="form-group">

            <label>Transaction Type</label>

            <select
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              required
            >

              <option value="inflow">
                Inflow
              </option>

              <option value="outflow">
                Outflow
              </option>

            </select>

          </div>


          {/* AMOUNT */}

          <div className="form-group">

            <label>Amount</label>

            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />

          </div>


          {/* CURRENCY */}

          <div className="form-group">

            <label>Currency</label>

            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >

              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>

            </select>

          </div>


          {/* INVOICE */}

          <div className="form-group">

            <label>Invoice Number</label>

            <input
              type="text"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleChange}
              placeholder="Invoice number"
            />

          </div>


          {/* ISSUE DATE */}

          <div className="form-group">

            <label>Issue Date</label>

            <input
              type="date"
              name="issue_date"
              value={formData.issue_date}
              onChange={handleChange}
            />

          </div>


          {/* DUE DATE */}

          <div className="form-group">

            <label>Due Date</label>

            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />

          </div>


          {/* PAID DATE */}

          <div className="form-group">

            <label>Paid Date</label>

            <input
              type="date"
              name="paid_date"
              value={formData.paid_date}
              onChange={handleChange}
            />

          </div>


          {/* STATUS */}

          <div className="form-group">

            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >

              <option value="pending">
                Pending
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="overdue">
                Overdue
              </option>

            </select>

          </div>


          {/* DESCRIPTION */}

          <div className="form-group full-width">

            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter transaction details"
              rows="4"
            />

          </div>


          {/* MESSAGE */}

          {message && (

            <div className="transaction-message">

              {message}

            </div>

          )}


          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >

            {loading
              ? 'Saving Transaction...'
              : 'Add Transaction'
            }

          </button>

        </form>

      </section>

    </div>
  )
}

export default TransactionForm