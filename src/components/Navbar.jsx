import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { dashboardPath, useAuth } from '../auth-context'
export default function Navbar() {
  const { user, logout } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const links = [['/', 'Home'], ['/vehicles', 'Vehicles']]
  if (user) {
    links.push([dashboardPath(user), 'Dashboard'])
    if (user.role === 'admin') links.push(['/admin/vehicles', 'Manage fleet'], ['/admin/bookings', 'Bookings'], ['/admin/customers', 'Customers'])
    else links.push(['/my-bookings', 'My bookings'])
    links.push(['/profile', 'Profile'])
  } else links.push(['/login', 'Log in'], ['/register', 'Register'])
  async function signOut() {
    setBusy(true); setError('')
    try { await logout(); navigate('/login') } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <><header className="navbar navbar-custom px-3 px-lg-4 py-3"><div className="container-fluid">
    <div className="d-flex align-items-center gap-2"><div className="brand-mark rounded-3 d-flex align-items-center justify-content-center fw-bold">VR</div>
      <div><strong className="d-block text-white">Vehicle Rental</strong><small className="d-block text-secondary">Management System</small></div></div>
    <nav className="main-nav d-flex flex-wrap align-items-center gap-2 mt-3 mt-lg-0">
      {links.map(([path, label]) => <NavLink end key={path} to={path} className={({ isActive }) => `nav-link navbar-menu-link px-3 ${isActive ? 'active' : ''}`}>{label}</NavLink>)}
      {user && <button className="btn btn-outline-light btn-sm" disabled={busy} onClick={signOut}>Log out</button>}
    </nav></div></header>{error && <div className="alert alert-danger" role="alert">{error}</div>}</>
}
