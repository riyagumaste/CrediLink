import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

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

        {/* Main Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Transaction */}
        <Route path="/transactions" element={<TransactionForm />} />

        {/* Other Credi pages */}
        <Route path="/cash-flow" element={<CashFlowWatch />} />

        <Route path="/trust-passport" element={<TrustPassport />} />

        <Route path="/exposure-review" element={<ExposureReview />} />

        <Route
          path="/counterparty-profile"
          element={<CounterpartyProfile />}
        />

        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App