import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './TransactionForm.css'

function TransactionForm() {
  const [businesses, setBusinesses] = useState([])
  const [counterparties, setCounterparties] = useState([])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

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

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('business_name')

      if (error) {
        console.error('Business loading error:', error)
        return
      }

      setBusinesses(data || [])
    }

    loadBusinesses()
  }, [])

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
        console.error('Counterparty loading error:', error)
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

    if (message) {
      setMessage('')
      setMessageType('')
    }

    if (name === 'business_id') {
      setFormData((previousData) => ({
        ...previousData,
        business_id: value,
        counterparty_id: '',
      }))
    }
  }

  function clearForm() {
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

    setCounterparties([])
    setMessage('')
    setMessageType('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setMessageType('')

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

      setMessage('Transaction added successfully.')
      setMessageType('success')

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

      setCounterparties([])

    } catch (error) {
      console.error('Transaction error:', error)

      setMessage(error.message || 'Unable to add transaction.')
      setMessageType('error')

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="transaction-page">

      {}
      <header className="transaction-header">

        <div className="header-content">
          <p className="eyebrow">
            CREDI / TRANSACTION MANAGEMENT
          </p>

          <h1>Add Transaction</h1>

          <p className="header-description">
            Record a business transaction to keep your financial
            records and insights up to date.
          </p>
        </div>

        <div className="transaction-badge">
          <span>FINANCIAL RECORD</span>
          <strong>Secure Entry</strong>
        </div>

      </header>


      {/*FORM CARD*/}
      <section className="transaction-card">

        {/* FORM HEADING */}
        <div className="form-heading">

          <div>
            <span className="section-label">
              Transaction Details
            </span>

            <h2>Enter transaction information</h2>
          </div>

          <span className="required-note">
            * Required fields
          </span>

        </div>


        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="transaction-form"
        >

          <div className="form-grid">

            {/* BUSINESS */}
            <div className="form-group">

              <label htmlFor="business_id">
                Your Business
                <span className="required">*</span>
              </label>

              <div className="select-wrapper">
                <select
                  id="business_id"
                  name="business_id"
                  value={formData.business_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select business
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

            </div>


            {/* COUNTERPARTY */}
            <div className="form-group">

              <label htmlFor="counterparty_id">
                Counterparty
              </label>

              <div className="select-wrapper">

                <select
                  id="counterparty_id"
                  name="counterparty_id"
                  value={formData.counterparty_id}
                  onChange={handleChange}
                  disabled={!formData.business_id}
                >
                  <option value="">
                    {formData.business_id
                      ? 'Select counterparty'
                      : 'Select a business first'}
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

            </div>


            {/* TRANSACTION TYPE */}
            <div className="form-group">

              <label htmlFor="transaction_type">
                Transaction Type
                <span className="required">*</span>
              </label>

              <div className="select-wrapper">

                <select
                  id="transaction_type"
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleChange}
                  required
                >
                  <option value="inflow">
                    Inflow — Money received
                  </option>

                  <option value="outflow">
                    Outflow — Money spent
                  </option>
                </select>

              </div>

            </div>


            {/* AMOUNT */}
            <div className="form-group">

              <label htmlFor="amount">
                Amount
                <span className="required">*</span>
              </label>

              <div className="amount-input">

                <span>
                  {formData.currency === 'INR'
                    ? '₹'
                    : formData.currency === 'USD'
                      ? '$'
                      : '€'}
                </span>

                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />

              </div>

            </div>


            {/* CURRENCY */}
            <div className="form-group">

              <label htmlFor="currency">
                Currency
              </label>

              <div className="select-wrapper">

                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="INR">
                    INR — Indian Rupee
                  </option>

                  <option value="USD">
                    USD — US Dollar
                  </option>

                  <option value="EUR">
                    EUR — Euro
                  </option>
                </select>

              </div>

            </div>


            {/* INVOICE */}
            <div className="form-group">

              <label htmlFor="invoice_number">
                Invoice Number
              </label>

              <input
                id="invoice_number"
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleChange}
                placeholder="e.g. INV-2026-001"
              />

            </div>


            {/* ISSUE DATE */}
            <div className="form-group">

              <label htmlFor="issue_date">
                Issue Date
              </label>

              <input
                id="issue_date"
                type="date"
                name="issue_date"
                value={formData.issue_date}
                onChange={handleChange}
              />

            </div>


            {/* DUE DATE */}
            <div className="form-group">

              <label htmlFor="due_date">
                Due Date
              </label>

              <input
                id="due_date"
                type="date"
                name="due_date"
                value={formData.due_date}
                min={formData.issue_date || undefined}
                onChange={handleChange}
              />

            </div>


            {/* PAID DATE */}
            <div className="form-group">

              <label htmlFor="paid_date">
                Paid Date
              </label>

              <input
                id="paid_date"
                type="date"
                name="paid_date"
                value={formData.paid_date}
                min={formData.issue_date || undefined}
                onChange={handleChange}
              />

            </div>


            {/* STATUS */}
            <div className="form-group">

              <label htmlFor="status">
                Status
              </label>

              <div className="select-wrapper">

                <select
                  id="status"
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

            </div>


            {/* DESCRIPTION */}
            <div className="form-group full-width">

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any relevant transaction details..."
                rows="4"
              />

              <span className="field-hint">
                Optional — add notes, payment details, or context.
              </span>

            </div>

          </div>


          {/* INFORMATION BOX */}
          <div className="transaction-info">

            <div className="info-icon">
              i
            </div>

            <div>
              <strong>Transaction records</strong>

              <p>
                Make sure the amount, transaction type and dates
                are accurate before submitting. This information
                may be used to generate your financial insights.
              </p>
            </div>

          </div>


          {/* MESSAGE */}
          {message && (
            <div
              className={`transaction-message ${messageType}`}
            >
              <span className="message-icon">
                {messageType === 'success' ? '✓' : '!'}
              </span>

              <span>{message}</span>
            </div>
          )}


          {/* ACTIONS */}
          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={clearForm}
              disabled={loading}
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Saving...
                </>
              ) : (
                'Add Transaction'
              )}
            </button>

          </div>

        </form>

      </section>

    </div>
  )
}

export default TransactionForm

