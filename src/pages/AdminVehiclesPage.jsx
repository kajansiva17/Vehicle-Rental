import { useState } from 'react'
import { api, imageChoices, vehicleView } from '../api'
import useApi from '../useApi'
import RequestState from '../components/RequestState'
const fields = [
  ['name','Vehicle name','text'], ['brand','Brand','text'], ['model','Model','text'], ['year','Manufacturing year','number'],
  ['registration_number','Registration number','text'], ['category','Category','text'], ['transmission','Transmission','text'],
  ['fuel_type','Fuel type','text'], ['seats','Number of seats','number'], ['price_per_day','Price per day (Rs.)','number'],
  ['mileage','Mileage (km)','number'], ['color','Color','text'],
]
function VehicleForm({ vehicle, done, cancel }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [image, setImage] = useState(vehicle?.image || '')
  const existingImage = imageChoices.some(item => item.value === image)
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    const values = Object.fromEntries(new FormData(event.currentTarget))
    for (const key of ['year','seats','mileage']) values[key] = Number(values[key])
    values.is_available = values.is_available === 'on'
    values.image = image || null
    if (vehicle) {
      for (const key of Object.keys(values)) if (String(values[key]) === String(vehicle[key])) delete values[key]
    }
    try { await api(`/admin/vehicles${vehicle ? `/${vehicle.id}` : ''}`, { method: vehicle ? 'PATCH' : 'POST', body: values }); done() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <form className="card card-body shadow-sm" onSubmit={submit}>
    <h2 className="h5">{vehicle ? `Edit ${vehicle.name}` : 'Add a vehicle'}</h2>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <div className="row g-3">{fields.map(([name,label,type]) => <label key={name} className="col-md-6 col-lg-4">{label}<input className="form-control" name={name} type={type} required defaultValue={vehicle?.[name] ?? (name === 'mileage' ? 0 : '')} min={name === 'year' ? 1886 : name === 'mileage' ? 0 : name === 'price_per_day' ? 0.01 : type === 'number' ? 1 : undefined} max={name === 'year' ? new Date().getFullYear() + 1 : name === 'seats' ? 100 : undefined} step={name === 'price_per_day' ? '0.01' : type === 'number' ? 1 : undefined} /></label>)}
      <label className="col-md-6">Status<select className="form-select" name="status" defaultValue={vehicle?.status || 'available'}>{['available','maintenance','inactive', ...(vehicle?.status === 'rented' ? ['rented'] : [])].map(status => <option key={status}>{status}</option>)}</select></label>
      <label className="col-md-6 d-flex align-items-end gap-2"><input type="checkbox" name="is_available" defaultChecked={vehicle?.is_available ?? true} />Accept new bookings when available</label>
      <label className="col-md-6">Original vehicle image<select className="form-select" value={existingImage ? image : ''} onChange={e => setImage(e.target.value)}><option value="">No original image selected</option>{imageChoices.map(item => <option key={item.value} value={item.value}>{item.name}</option>)}</select></label>
      <label className="col-md-6">Image URL (optional)<input className="form-control" value={existingImage ? '' : image} placeholder="https://…" onChange={e => setImage(e.target.value)} /></label>
      {image && <div className="col-12"><img src={vehicleView({ image }).image} alt="Vehicle preview" className="rounded object-fit-cover" width="240" height="150" /></div>}
    </div><div className="d-flex gap-2 mt-4"><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save vehicle'}</button><button type="button" className="btn btn-outline-secondary" onClick={cancel}>Cancel</button></div>
  </form>
}
export default function AdminVehiclesPage() {
  const request = useApi('/admin/vehicles', true)
  const [editor, setEditor] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  async function remove(vehicle) {
    if (!window.confirm(`Delete ${vehicle.name}? Vehicles with booking history must be deactivated instead.`)) return
    setBusy(vehicle.id); setError('')
    try { await api(`/admin/vehicles/${vehicle.id}`, { method: 'DELETE' }); request.reload() }
    catch (e) { setError(e.message) } finally { setBusy(null) }
  }
  return <div className="d-grid gap-3"><div className="d-flex justify-content-between align-items-center"><h1 className="h3">Manage fleet</h1><button className="btn btn-primary" onClick={() => setEditor({})}>Add vehicle</button></div>
    {editor && <VehicleForm key={editor.id || 'new'} vehicle={editor.id ? editor : null} cancel={() => setEditor(null)} done={() => { setEditor(null); request.reload() }} />}
    <RequestState {...request} />{error && <div className="alert alert-danger" role="alert">{error}</div>}
    {!request.loading && !request.error && <div className="card table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Vehicle</th><th>Registration</th><th>Daily price</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {request.data.map(vehicle => <tr key={vehicle.id}><td>{vehicleView(vehicle).image && <img src={vehicleView(vehicle).image} alt={vehicle.name} width="80" height="50" className="rounded object-fit-cover me-2" />}{vehicle.name}</td><td>{vehicle.registration_number}</td><td>Rs. {vehicle.price_per_day}</td><td className="text-capitalize">{vehicle.status}{!vehicle.is_available && ' · bookings paused'}</td><td><div className="d-flex gap-2"><button className="btn btn-sm btn-outline-primary" onClick={() => setEditor(vehicle)}>Edit</button><button className="btn btn-sm btn-outline-danger" disabled={busy === vehicle.id} onClick={() => remove(vehicle)}>Delete</button></div></td></tr>)}
      {!request.data.length && <tr><td colSpan="5">Your fleet is empty. Add your first vehicle to get started.</td></tr>}
    </tbody></table></div>}
  </div>
}
