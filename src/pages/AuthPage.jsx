import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { dashboardPath, useAuth } from '../auth-context'
export default function AuthPage({ register = false }) {
  const { user, loading, login, error: sessionError } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo
  const customerDestination = typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//')
    ? returnTo : null
  if (loading) return <p role="status">Checking your session…</p>
  if (user) return <Navigate to={user.role === 'customer' && customerDestination ? customerDestination : dashboardPath(user)} replace />
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    try {
      if (register) {
        if (values.password !== values.confirm_password) throw new Error('Passwords do not match.')
        delete values.confirm_password
        await api('/auth/register', { method: 'POST', body: values })
      }
      const account = await login({ email: values.email, password: values.password })
      navigate(account.role === 'customer' && customerDestination ? customerDestination : dashboardPath(account), { replace: true })
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <section className="card shadow-sm mx-auto" style={{ maxWidth: 480 }}><div className="card-body p-4">
    <span className="badge text-bg-info mb-2">Vehicle Rental</span><h1 className="h3">{register ? 'Create your account' : 'Welcome back'}</h1>
    <p className="text-secondary">{register ? 'Register to book and manage your rentals.' : 'Log in to manage your rentals or your fleet.'}</p>
    {(error || sessionError) && <div className="alert alert-danger" role="alert">{error || sessionError}</div>}
    <form onSubmit={submit} className="d-grid gap-3">
      {register && <><label>Full name<input className="form-control" name="full_name" autoComplete="name" required maxLength={120} /></label>
        <label>Phone number<input className="form-control" name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} /></label></>}
      <label>Email<input className="form-control" name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input className="form-control" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 10 : 1} maxLength={128} /></label>
      {register && <label>Confirm password<input className="form-control" name="confirm_password" type="password" autoComplete="new-password" required minLength={10} /></label>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Please wait…' : register ? 'Register' : 'Log in'}</button>
    </form><p className="mt-3 mb-0">{register ? 'Already registered? ' : 'New here? '}<Link to={register ? '/login' : '/register'} state={location.state}>{register ? 'Log in' : 'Create an account'}</Link></p>
  </div></section>
}
