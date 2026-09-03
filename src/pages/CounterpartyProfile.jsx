import './CounterpartyProfile.css'

function CounterpartyProfile() {
  const counterparty = {
    name: 'Northstar Supplies Pvt. Ltd.',
    id: 'CRD-CP-2087',
    trustScore: 76,
    paymentRate: 88,
    averageDelay: 4.2,
    transactions: 32,
    completed: 28,
    delayed: 4,
  }

  const transactions = [
    {
      invoice: 'INV-1048',
      amount: '₹2,40,000',
      date: '12 Aug 2026',
      dueDate: '20 Aug 2026',
      status: 'Paid',
      delay: '0 days',
    },
    {
      invoice: 'INV-1039',
      amount: '₹1,85,000',
      date: '03 Aug 2026',
      dueDate: '10 Aug 2026',
      status: 'Paid',
      delay: '2 days',
    },
    {
      invoice: 'INV-1027',
      amount: '₹3,10,000',
      date: '18 Jul 2026',
      dueDate: '28 Jul 2026',
      status: 'Delayed',
      delay: '9 days',
    },
    {
      invoice: 'INV-1018',
      amount: '₹1,25,000',
      date: '05 Jul 2026',
      dueDate: '15 Jul 2026',
      status: 'Paid',
      delay: '1 day',
    },
  ]

  return (
    <div className="counterparty-page">

      {/* HEADER */}

      <header className="counterparty-header">

        <div>
          <p className="eyebrow">CREDI / COUNTERPARTY INTELLIGENCE</p>

          <h1>Counterparty Profile</h1>

          <p>
            Understand the trustworthiness and payment behaviour
            of a business you transact with.
          </p>
        </div>

        <div className="verified-badge">
          ✓ Verified
        </div>

      </header>


      {/* IDENTITY */}

      <section className="counterparty-card identity-card">

        <div className="company-avatar">
          NS
        </div>

        <div className="company-info">
          <p className="section-label">COUNTERPARTY</p>

          <h2>{counterparty.name}</h2>

          <span>{counterparty.id}</span>
        </div>

        <div className="relationship">

          <span>Your relationship</span>

          <strong>Active Counterparty</strong>

        </div>

      </section>


      {/* SCORE + METRICS */}

      <section className="counterparty-overview">

        <div className="counterparty-card score-card">

          <p className="section-label">COUNTERPARTY TRUST SCORE</p>

          <div className="score-display">
            <strong>{counterparty.trustScore}</strong>
            <span>/100</span>
          </div>

          <div className="score-status">
            Moderate Trust
          </div>

          <p>
            The score reflects observed payment behaviour,
            transaction history and reliability.
          </p>

        </div>


        <div className="counterparty-card metrics-card">

          <div className="cp-metric">
            <span>On-Time Payment Rate</span>
            <strong>{counterparty.paymentRate}%</strong>
          </div>

          <div className="cp-metric">
            <span>Average Payment Delay</span>
            <strong>{counterparty.averageDelay} days</strong>
          </div>

          <div className="cp-metric">
            <span>Total Transactions</span>
            <strong>{counterparty.transactions}</strong>
          </div>

          <div className="cp-metric">
            <span>Completed Successfully</span>
            <strong>{counterparty.completed}</strong>
          </div>

        </div>

      </section>


      {/* TRANSACTION HISTORY */}

      <section className="counterparty-card transaction-section">

        <div className="section-heading">

          <div>
            <p className="section-label">PAYMENT HISTORY</p>
            <h2>Recent Transactions</h2>
          </div>

          <span className="transaction-count">
            {counterparty.transactions} total
          </span>

        </div>


        <div className="transaction-table">

          <div className="table-header">
            <span>Invoice</span>
            <span>Amount</span>
            <span>Due Date</span>
            <span>Status</span>
            <span>Delay</span>
          </div>


          {transactions.map((transaction) => (

            <div
              className="table-row"
              key={transaction.invoice}
            >

              <span className="invoice-number">
                {transaction.invoice}
              </span>

              <span>
                {transaction.amount}
              </span>

              <span>
                {transaction.dueDate}
              </span>

              <span>
                <strong
                  className={
                    transaction.status === 'Paid'
                      ? 'status-paid'
                      : 'status-delayed'
                  }
                >
                  {transaction.status}
                </strong>
              </span>

              <span>
                {transaction.delay}
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* RISK INDICATORS */}

      <section className="risk-section">

        <div className="counterparty-card risk-card">

          <p className="section-label">RISK INDICATORS</p>

          <h2>Observed Behaviour</h2>

          <div className="risk-item positive">
            <span>✓</span>
            <div>
              <strong>Consistent transaction activity</strong>
              <p>
                The counterparty has maintained regular transaction activity.
              </p>
            </div>
          </div>

          <div className="risk-item positive">
            <span>✓</span>
            <div>
              <strong>88% payments on time</strong>
              <p>
                Most recorded payments were completed within the agreed period.
              </p>
            </div>
          </div>

          <div className="risk-item warning">
            <span>!</span>
            <div>
              <strong>Recent payment delays</strong>
              <p>
                Several transactions experienced delays beyond the due date.
              </p>
            </div>
          </div>

        </div>


        {/* EXPLAINABILITY */}

        <div className="counterparty-card explain-card">

          <p className="section-label">EXPLAINABILITY</p>

          <h2>Why this rating?</h2>

          <p>
            Credi combines observable transaction behaviour
            into an understandable counterparty assessment.
          </p>

          <div className="rating-breakdown">

            <div>
              <span>Payment reliability</span>
              <strong>88%</strong>
            </div>

            <div>
              <span>Transaction consistency</span>
              <strong>81%</strong>
            </div>

            <div>
              <span>Delay risk</span>
              <strong>Medium</strong>
            </div>

          </div>

        </div>

      </section>

    </div>
  )
}

export default CounterpartyProfile