import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/DashboardLayout'
import QuotationGenerator from './pages/QuotationGenerator'
import InvoiceGenerator from './pages/InvoiceGenerator'
import Dialer from './pages/Dialer'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/quotation" replace /> : <LoginPage />
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/" replace />
        }
      >
        <Route path="quotation" element={<QuotationGenerator />} />
        <Route path="invoice" element={<InvoiceGenerator />} />
        <Route path="dialer" element={<Dialer />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
