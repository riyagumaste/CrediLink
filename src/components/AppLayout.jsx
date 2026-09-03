import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import './AppLayout.css'

function AppLayout() {
  const location = useLocation()

  // Hide the sidebar only on the main dashboard
  const isDashboard = location.pathname === '/dashboard'

  return (
    <div className="app-layout">

      {!isDashboard && <Sidebar />}

      <main className={isDashboard ? 'app-main dashboard-main' : 'app-main'}>
        <Outlet />
      </main>

    </div>
  )
}

export default AppLayout