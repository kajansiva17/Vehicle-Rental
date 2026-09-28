import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { dashboardPath, useAuth } from '../auth-context'
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <p role="status">Checking your session…</p>
  if (!user) return <Navigate to="/login" state={{ returnTo: location.pathname + location.search }} replace />
  if (role && user.role !== role) return <Navigate to={dashboardPath(user)} replace />
  return <Outlet />
}
