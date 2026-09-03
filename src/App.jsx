import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import AppLayout from './components/AppLayout'

import Dashboard from './pages/Dashboard'
import CashFlowWatch from './pages/CashFlowWatch'
import TrustPassport from './pages/TrustPassport'
import ExposureReview from './pages/ExposureReview'
import CounterpartyProfile from './pages/CounterpartyProfile'
import TransactionForm from './pages/TransactionForm'

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* All pages inside this layout will have the sidebar */}
        <Route element={<AppLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/transactions"
            element={<TransactionForm />}
          />

          <Route
            path="/cash-flow"
            element={<CashFlowWatch />}
          />

          <Route
            path="/trust-passport"
            element={<TrustPassport />}
          />

          <Route
            path="/exposure-review"
            element={<ExposureReview />}
          />

          <Route
            path="/counterparty-profile"
            element={<CounterpartyProfile />}
          />

        </Route>


        {/* Home goes to Dashboard */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />


        {/* Unknown pages go to Dashboard */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App