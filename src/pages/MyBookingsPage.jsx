import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api'
import useApi from '../useApi'
import RequestState from '../components/RequestState'
const transitions = { pending: ['confirmed', 'cancelled'], confirmed: ['active', 'cancelled'], active: ['completed', 'cancelled'] }
export default function MyBookingsPage({ admin = false }) {
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  const location = useLocation()
  const params = new URLSearchParams({ ...(status ? { status } : {}), ...(admin && query ? { q: query } : {}) })
  const request = useApi(`${admin ? '/admin' : ''}/bookings?${params}`, true)
  async function change(booking, next) {
    if (next === 'cancelled' && !window.confirm(`Cancel booking #${booking.id}?`)) return
    setBusy(booking.id); setError('')
    try {
      await api(admin ? `/admin/bookings/${booking.id}` : `/bookings/${booking.id}/cancel`, { method: admin ? 'PATCH' : 'POST', ...(admin ? { body: { status: next } } : {}) })
      request.reload()
    } catch (e) { setError(e.message) } finally { setBusy(null) }
  }
  return <div className="d-grid gap-3"><h1 className="h3">{admin ? 'Manage bookings' : 'My bookings'}</h1>
    {location.state?.message && <div className="alert alert-success" role="status">{location.state.message}</div>}
    <div className="d-flex flex-wrap gap-3"><label>Status<select className="form-select" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{['pending','confirmed','active','completed','cancelled'].map(item => <option key={item}>{item}</option>)}</select></label>
      {admin && <label>Search bookings<input className="form-control" value={query} onChange={e => setQuery(e.target.value)} placeholder="Customer, registration or booking ID" /></label>}</div>
    <RequestState {...request} />{error && <div className="alert alert-danger" role="alert">{error}</div>}
    {!request.loading && !request.error && request.data?.length === 0 && <p>No bookings found. {!admin && <Link to="/vehicles">Browse vehicles</Link>}</p>}
    {!request.loading && request.data?.map(booking => <article key={booking.id} className="card shadow-sm"><div className="card-body">
      <div className="d-flex justify-content-between"><h2 className="h5">Booking #{booking.id} ? {booking.vehicle.name}</h2><span className="badge text-bg-info align-self-start text-capitalize">{booking.status}</span></div>
      <p>{booking.start_date} ? {booking.end_date} ? {booking.rental_days} days ? <strong>Rs. {booking.total_amount}</strong></p>
      <details><summary>Booking details</summary><p className="mt-2">Vehicle registration: {booking.vehicle.registration_number}<br />Daily price at booking: Rs. {booking.price_per_day}<br />Created: {new Date(booking.created_at + 'Z').toLocaleString()}{admin && <><br />Customer ID: {booking.customer_id}</>}</p></details>
      <div className="d-flex flex-wrap gap-2 mt-3">{(admin ? transitions[booking.status] || [] : ['pending','confirmed'].includes(booking.status) && booking.start_date > new Date().toISOString().slice(0, 10) ? ['cancelled'] : []).map(next => <button key={next} disabled={busy === booking.id} className={`btn btn-sm ${next === 'cancelled' ? 'btn-outline-danger' : 'btn-primary'}`} onClick={() => change(booking, next)}>{({ confirmed: 'Confirm', active: 'Start rental', completed: 'Complete rental', cancelled: 'Cancel booking' })[next]}</button>)}</div>
    </div></article>)}
  </div>
}
