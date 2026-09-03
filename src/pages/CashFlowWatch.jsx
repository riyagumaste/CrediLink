import './CashFlowWatch.css'

function CashFlowWatch() {
  const summary = {
    inflow: '₹8.6L',
    outflow: '₹5.2L',
    netFlow: '₹3.4L',
    upcoming: '₹2.1L',
  }

  const monthlyFlow = [
    {
      month: 'Mar',
      inflow: 5.8,
      outflow: 4.1,
    },
    {
      month: 'Apr',
      inflow: 6.4,
      outflow: 4.5,
    },
    {
      month: 'May',
      inflow: 7.1,
      outflow: 5.0,
    },
    {
      month: 'Jun',
      inflow: 6.7,
      outflow: 4.8,
    },
    {
      month: 'Jul',
      inflow: 8.0,
      outflow: 5.3,
    },
    {
      month: 'Aug',
      inflow: 8.6,
      outflow: 5.2,
    },
  ]

  const receivables = [
    {
      counterparty: 'Northstar Supplies',
      amount: '₹2.4L',
      due: '3 days',
      status: 'Expected',
    },
    {
      counterparty: 'Vertex Components',
      amount: '₹1.2L',
      due: '6 days',
      status: 'At Risk',
    },
    {
      counterparty: 'BluePeak Traders',
      amount: '₹85K',
      due: '10 days',
      status: 'Expected',
    },
  ]

  return (
    <div className="cashflow-page">

      {/* HEADER */}

      <header className="cashflow-header">

        <div>
          <p className="eyebrow">CREDI / FINANCIAL MONITORING</p>

          <h1>Cash Flow Watch</h1>

          <p>
            Monitor cash movement, upcoming receivables and potential
            payment pressure.
          </p>
        </div>

        <div className="cash-health">

          <span>Cash Flow Health</span>

          <strong>Healthy</strong>

        </div>

      </header>


      {/* SUMMARY */}

      <section className="cash-summary">

        <div className="cash-card">
          <p>Cash Inflow</p>
          <strong>{summary.inflow}</strong>
          <span>This period</span>
        </div>

        <div className="cash-card">
          <p>Cash Outflow</p>
          <strong>{summary.outflow}</strong>
          <span>This period</span>
        </div>

        <div className="cash-card net-card">
          <p>Net Cash Flow</p>
          <strong>{summary.netFlow}</strong>
          <span>Positive movement</span>
        </div>

        <div className="cash-card">
          <p>Upcoming Receivables</p>
          <strong>{summary.upcoming}</strong>
          <span>Expected soon</span>
        </div>

      </section>


      {/* TREND + HEALTH */}

      <section className="cashflow-grid">

        <div className="cash-card chart-card">

          <div className="section-heading">

            <div>
              <p className="section-label">CASH MOVEMENT</p>
              <h2>Inflow vs Outflow</h2>
            </div>

            <span>Last 6 months</span>

          </div>


          <div className="flow-chart">

            {monthlyFlow.map((month) => {

              const maxValue = 10

              const inflowHeight =
                `${(month.inflow / maxValue) * 100}%`

              const outflowHeight =
                `${(month.outflow / maxValue) * 100}%`

              return (
                <div
                  className="chart-column"
                  key={month.month}
                >

                  <div className="bars">

                    <div
                      className="flow-bar inflow"
                      style={{
                        height: inflowHeight,
                      }}
                      title={`Inflow: ₹${month.inflow}L`}
                    />

                    <div
                      className="flow-bar outflow"
                      style={{
                        height: outflowHeight,
                      }}
                      title={`Outflow: ₹${month.outflow}L`}
                    />

                  </div>

                  <span>{month.month}</span>

                </div>
              )
            })}

          </div>


          <div className="chart-legend">

            <div>
              <span className="legend inflow-dot" />
              Inflow
            </div>

            <div>
              <span className="legend outflow-dot" />
              Outflow
            </div>

          </div>

        </div>


        {/* HEALTH */}

        <div className="cash-card health-card">

          <p className="section-label">CASH POSITION</p>

          <h2>Current Health</h2>

          <div className="health-score">
            <strong>78</strong>
            <span>/100</span>
          </div>

          <div className="health-progress">
            <div />
          </div>

          <p className="health-status">
            Stable cash position
          </p>

          <p className="health-description">
            Current inflows exceed outflows and expected receivables
            provide additional short-term liquidity.
          </p>

        </div>

      </section>


      {/* RECEIVABLES */}

      <section className="cash-card receivables-section">

        <div className="section-heading">

          <div>
            <p className="section-label">UPCOMING CASH</p>
            <h2>Receivables Watch</h2>
          </div>

          <span>Next payments</span>

        </div>


        <div className="receivables-table">

          <div className="receivables-header">
            <span>Counterparty</span>
            <span>Amount</span>
            <span>Due</span>
            <span>Status</span>
          </div>


          {receivables.map((item) => (

            <div
              className="receivable-row"
              key={item.counterparty}
            >

              <strong>{item.counterparty}</strong>

              <span>{item.amount}</span>

              <span>{item.due}</span>

              <span
                className={
                  item.status === 'Expected'
                    ? 'expected-status'
                    : 'risk-status'
                }
              >
                {item.status}
              </span>

            </div>

          ))}

        </div>

      </section>


      {/* ALERT */}

      <section className="cash-alert">

        <div className="alert-icon">!</div>

        <div>

          <p className="section-label">WATCH ITEM</p>

          <h2>One receivable may require attention</h2>

          <p>
            ₹1.2L from Vertex Components is currently marked as
            potentially at risk based on observed payment behaviour.
          </p>

        </div>

      </section>

    </div>
  )
}

export default CashFlowWatch