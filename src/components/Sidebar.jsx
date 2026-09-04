import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">

      {/* Credi logo - clicking it returns to the dashboard */}
      <NavLink to="/dashboard" className="sidebar-logo">

        <div className="brand-mark">
          C
        </div>

        <div className="brand-text">
          <h1>Credi</h1>
          <span>Business Trust Intelligence</span>
        </div>

      </NavLink>


      {/* Main navigation */}
      <nav className="sidebar-nav">

        {/* Main pages */}
        <div className="nav-group">

          <p className="nav-section">MAIN</p>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">▦</span>
            <span className="nav-label">Dashboard</span>
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">＋</span>
            <span className="nav-label">Add Transaction</span>
          </NavLink>

        </div>


        {/* Trust intelligence features */}
        <div className="nav-group">

          <p className="nav-section">TRUST INTELLIGENCE</p>

          <NavLink
            to="/ask-credi"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">✦</span>
            <span className="nav-label">Ask Credi</span>
          </NavLink>

          <NavLink
            to="/trust-passport"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">◇</span>
            <span className="nav-label">Trust Passport</span>
          </NavLink>

          <NavLink
            to="/counterparty-profile"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">◎</span>
            <span className="nav-label">Counterparty</span>
          </NavLink>

          <NavLink
            to="/exposure-review"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">◈</span>
            <span className="nav-label">Exposure Review</span>
          </NavLink>

        </div>


        {/* Monitoring features */}
        <div className="nav-group">

          <p className="nav-section">MONITORING</p>

          <NavLink
            to="/cash-flow"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">↗</span>
            <span className="nav-label">Cash Flow Watch</span>
          </NavLink>

        </div>


        {/* Lender-specific features */}
        <div className="nav-group">

          <p className="nav-section">FOR LENDERS</p>

          <NavLink
            to="/lender"
            className={({ isActive }) =>
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">▣</span>
            <span className="nav-label">Lender View</span>
          </NavLink>

        </div>

      </nav>


      {/* Sidebar footer */}
      <div className="sidebar-footer">

        <div className="footer-brand">

          <div className="footer-dot"></div>

          <div>
            <span>Credi Platform</span>
            <small>Trust infrastructure for businesses</small>
          </div>

        </div>

        <div className="footer-status">
          <span className="status-dot"></span>
          System operational
        </div>

      </div>

    </aside>
  )
}

export default Sidebar