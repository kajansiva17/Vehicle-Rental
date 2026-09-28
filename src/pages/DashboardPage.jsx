import { Link, Navigate, useLocation } from 'react-router-dom'
import { dashboardPath, useAuth } from '../auth-context'
import useApi from '../useApi'
import RequestState from '../components/RequestState'
export default function DashboardPage() {
  const { user } = useAuth()
  const admin = user.role === 'admin'
  const request = useApi(admin ? '/admin/dashboard' : '/dashboard')
  const location = useLocation()
  if (location.pathname === '/dashboard') return <Navigate to={dashboardPath(user)} replace />
  const data = request.data
  const counts = admin ? data : data?.booking_counts
  return <div className="d-grid gap-4"><div><span className="badge text-bg-info mb-2">{admin ? 'Administrator' : 'Customer'}</span><h1 className="h3">Welcome, {user.full_name}</h1></div>
    <RequestState {...request} />
    {data && <><div className="row g-3">{Object.entries(counts).map(([key, value]) => <div className="col-sm-6 col-lg-3" key={key}><div className="card h-100 shadow-sm"><div className="card-body"><span className="text-capitalize">{key.replaceAll('_', ' ')}</span><strong className="fs-3 d-block">{key.includes('revenue') ? `Rs. ${value}` : value}</strong></div></div></div>)}</div>
      <div className="d-flex flex-wrap gap-2">{(admin ? [['/admin/vehicles','Manage vehicles'], ['/admin/bookings','Manage bookings'], ['/admin/customers','Manage customers']] : [['/vehicles','Find a vehicle'], ['/my-bookings','All my bookings'], ['/profile','My profile']]).map(([path,label]) => <Link key={path} to={path} className="btn btn-primary">{label}</Link>)}</div>
      {!admin && ['current','upcoming','previous'].map(period => <section key={period}><h2 className="h5 text-capitalize">{period} bookings</h2>{data[`${period}_bookings`].length ? data[`${period}_bookings`].map(booking => <div className="card p-3 mb-2" key={booking.id}><Link to="/my-bookings">#{booking.id} ? {booking.vehicle.name}</Link><span>{booking.start_date} ? {booking.end_date} ? {booking.status} ? Rs. {booking.total_amount}</span></div>) : <p className="text-secondary">No {period} bookings.</p>}</section>)}
    </>}
  </div>
}
