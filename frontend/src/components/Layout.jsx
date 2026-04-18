import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-900">SmartSeason</span>
            {user?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/fields"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Fields
                </Link>
              </>
            )}
            {user?.role === 'AGENT' && (
              <Link
                to="/agent/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout