import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminFields from './pages/admin/Fields'
import AgentDashboard from './pages/agent/Dashboard'
import FieldDetail from './pages/agent/FieldDetail'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fields"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminFields />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent/dashboard"
              element={
                <ProtectedRoute role="AGENT">
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/fields/:id"
              element={
                <ProtectedRoute role="AGENT">
                  <FieldDetail />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <p className="text-gray-500">You are not authorized to view this page.</p>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App