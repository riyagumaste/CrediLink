import { NavLink } from 'react-router-dom'

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h1>Credi</h1>
        <span>Business Trust Intelligence</span>
      </div>

      <nav className="sidebar-nav">

        <p className="nav-section">MAIN</p>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span>▦</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/transactions/new"
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span>＋</span>
          Add Transaction
        </NavLink>

        <p className="nav-section">TRUST INTELLIGENCE</p>

        <NavLink
          to="/trust-passport"
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span>◇</span>
          Trust Passport
        </NavLink>

        <NavLink
          to="/counterparty"
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span>◎</span>
          Counterparty
        </NavLink>

        <NavLink
          to="/exposure"
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span>◈</span>
          Exposure Review
        </NavLink>

        <NavLink
          to="/cash-flow"
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span>↗</span>
          Cash Flow Watch
        </NavLink>

        <p className="nav-section">VERIFICATION</p>

        <NavLink
          to="/verification"
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span>✓</span>
          Verification
        </NavLink>

        <NavLink
          to="/lender"
          className={({ isActive }) =>
            isActive ? 'nav-item active' : 'nav-item'
          }
        >
          <span>▣</span>
          Lender View
        </NavLink>

      </nav>

      <div className="sidebar-footer">
        <span>Credi</span>
        <small>Trust infrastructure for businesses</small>
      </div>

    </aside>
  )
}

export default Sidebar