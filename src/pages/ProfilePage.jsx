import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, tokenStore } from '../api'
import { useAuth } from '../auth-context'
export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  async function submit(event, password = false) {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true)
    const values = Object.fromEntries(new FormData(event.currentTarget))
    try {
      if (password) {
        await api('/users/me/password', { method: 'POST', body: values })
        tokenStore.set(null); setUser(null); navigate('/login')
      } else {
        setUser(await api('/users/me', { method: 'PATCH', body: values })); setMessage('Profile updated.')
      }
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <div className="row g-4"><h1 className="h3">My profile</h1>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    <div className="col-lg-6"><form className="card card-body shadow-sm d-grid gap-3" onSubmit={submit}>
      <h2 className="h5">Account details</h2><p className="text-capitalize">{user.role} · Active account</p>
      <label>Full name<input className="form-control" name="full_name" defaultValue={user.full_name} required maxLength={120} /></label>
      <label>Email<input className="form-control" name="email" type="email" defaultValue={user.email} required /></label>
      <label>Phone<input className="form-control" name="phone" type="tel" defaultValue={user.phone} required minLength={7} maxLength={30} /></label>
      <button className="btn btn-primary" disabled={busy}>Save profile</button>
    </form></div>
    <div className="col-lg-6"><form className="card card-body shadow-sm d-grid gap-3" onSubmit={e => submit(e, true)}>
      <h2 className="h5">Change password</h2><p>You will need to log in again after changing your password.</p>
      <label>Current password<input className="form-control" name="current_password" type="password" autoComplete="current-password" required /></label>
      <label>New password<input className="form-control" name="new_password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} /></label>
      <button className="btn btn-outline-primary" disabled={busy}>Change password</button>
    </form></div></div>
}
