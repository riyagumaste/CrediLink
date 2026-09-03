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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionForm />} />
        <Route path="/cash-flow" element={<CashFlowWatch />} />
        <Route path="/trust-passport" element={<TrustPassport />} />
        <Route path="/exposure-review" element={<ExposureReview />} />
        <Route
          path="/counterparty-profile"
          element={<CounterpartyProfile />}
        />

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App