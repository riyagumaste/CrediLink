import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import AppLayout from './components/AppLayout'

import Dashboard from './pages/Dashboard'
import CashFlowWatch from './pages/CashFlowWatch'
import TrustPassport from './pages/TrustPassport'
import ExposureReview from './pages/ExposureReview'
import CounterpartyProfile from './pages/CounterpartyProfile'
import TransactionForm from './pages/TransactionForm'
import AskCredi from './pages/AskCredi'
import LenderView from './pages/LenderView'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* All application pages use the main layout and sidebar */}
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

          <Route
            path="/ask-credi"
            element={<AskCredi />}
          />

          <Route
            path="/lender"
            element={<LenderView />}
          />

        </Route>

        {/* Opening the app starts on the dashboard */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Any unknown URL goes back to the dashboard */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App