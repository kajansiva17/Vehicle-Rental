import { useState } from 'react'
import { api } from '../api'
import useApi from '../useApi'
import RequestState from '../components/RequestState'
export default function AdminCustomersPage() {
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  const request = useApi(`/admin/customers?q=${encodeURIComponent(query)}`, true)
  async function toggle(customer) {
    if (!window.confirm(`${customer.is_active ? 'Deactivate' : 'Activate'} ${customer.full_name}'s account?`)) return
    setBusy(customer.id); setError('')
    try { await api(`/admin/customers/${customer.id}`, { method: 'PATCH', body: { is_active: !customer.is_active } }); request.reload() }
    catch (e) { setError(e.message) } finally { setBusy(null) }
  }
  return <div className="d-grid gap-3"><h1 className="h3">Manage customers</h1>
    <label>Search customers<input className="form-control" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or email" /></label>
    <RequestState {...request} />{error && <div className="alert alert-danger" role="alert">{error}</div>}
    {!request.loading && !request.error && <div className="card table-responsive"><table className="table mb-0"><thead><tr><th>Customer</th><th>Contact</th><th>Account</th><th>Action</th></tr></thead><tbody>
      {request.data.map(customer => <tr key={customer.id}><td>{customer.full_name}<small className="d-block text-secondary">#{customer.id} · Joined {customer.created_at.slice(0, 10)}</small></td><td>{customer.email}<br />{customer.phone}</td><td>{customer.is_active ? 'Active' : 'Inactive'}</td><td><button className="btn btn-sm btn-outline-primary" disabled={busy === customer.id} onClick={() => toggle(customer)}>{customer.is_active ? 'Deactivate' : 'Activate'}</button></td></tr>)}
      {!request.data.length && <tr><td colSpan="4">No registered customers found.</td></tr>}
    </tbody></table></div>}
  </div>
}
