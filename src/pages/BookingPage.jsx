import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, vehicleView } from '../api'
import { useAuth } from '../auth-context'
import useApi from '../useApi'
import RequestState from '../components/RequestState'
export default function BookingPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const request = useApi('/vehicles?available=true', true)
  const [vehicleId, setVehicleId] = useState(id || '')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [quote, setQuote] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const vehicle = request.data?.find(item => item.id === Number(vehicleId))
  const quoteMatches = quote?.vehicle_id === Number(vehicleId) && quote?.start_date === start && quote?.end_date === end
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      if (!quoteMatches) {
        const result = await api(`/vehicles/${vehicleId}/availability?start_date=${start}&end_date=${end}`)
        setQuote(result)
        if (!result.available) setError('This vehicle is unavailable for those dates. Choose different dates.')
      } else {
        await api('/bookings', { method: 'POST', body: { vehicle_id: Number(vehicleId), start_date: start, end_date: end } })
        navigate('/my-bookings', { state: { message: 'Booking submitted. An administrator will review your request.' } })
      }
    } catch (e) { setError(e.message); setQuote(null) } finally { setBusy(false) }
  }
  return <div className="d-grid gap-4"><h1 className="h3">Book your vehicle</h1><RequestState {...request} />
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    {!request.loading && !request.error && (!request.data.length ? <p>No vehicles are currently available. <Link to="/vehicles">Browse fleet</Link></p> :
    <form onSubmit={submit} className="card shadow-sm"><div className="card-body d-grid gap-3">
      <p>Booking as <strong>{user.full_name}</strong> ? {user.email} ? {user.phone} <Link to="/profile">Edit profile</Link></p>
      <label>Vehicle<select className="form-select" required value={vehicleId} onChange={e => setVehicleId(e.target.value)}><option value="">Select a vehicle</option>{request.data.map(item => <option key={item.id} value={item.id}>{item.name} ? Rs. {item.price_per_day}/day</option>)}</select></label>
      {vehicle && vehicleView(vehicle).image && <img src={vehicleView(vehicle).image} alt={vehicle.name} className="rounded object-fit-cover" width="240" height="150" />}
      <div className="row g-3"><label className="col-md-6">Pickup date<input className="form-control" type="date" required min={new Date().toISOString().slice(0, 10)} value={start} onChange={e => setStart(e.target.value)} /></label>
      <label className="col-md-6">Return date<input className="form-control" type="date" required min={start || new Date().toISOString().slice(0, 10)} value={end} onChange={e => setEnd(e.target.value)} /></label></div>
      <p className="text-secondary mb-0">The return date is not charged. Your reservation is secured when an administrator confirms it.</p>
      {quoteMatches && <div className="alert alert-info">{quote.available ? 'Available' : 'Unavailable'} ? {quote.rental_days} days ? Rs. {quote.price_per_day} = <strong>Rs. {quote.total_amount}</strong></div>}
      <button className="btn btn-primary" disabled={busy || (quoteMatches && !quote.available)}>{busy ? 'Please wait?' : quoteMatches && quote.available ? 'Submit booking request' : 'Check availability and price'}</button>
    </div></form>)}
  </div>
}
