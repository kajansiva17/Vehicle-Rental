import { Link } from 'react-router-dom'
import { useAuth } from '../auth-context'

function VehicleCard({ vehicle }) {
  const { user } = useAuth()
  const bookingPath = `/booking/${vehicle.id}`
  const bookingAllowed = vehicle.available && user?.role !== 'admin'
  const status = vehicle.status === 'maintenance' ? 'Maintenance' : vehicle.available ? 'Available' : 'Unavailable'
  return (
    <div className="vehicle-card card h-100 shadow-sm">
      {vehicle.image && <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="card-img-top" />}
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <span className="badge text-bg-info">{vehicle.category}</span>
          <span className={`status-badge badge ${vehicle.available ? 'status-available' : 'status-unavailable'}`}>
            {status}
          </span>
        </div>

        <h3 className="h5 mt-3 mb-1">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="text-secondary small mb-2">{vehicle.registrationNumber}</p>
        {vehicle.registrationNumber.startsWith('DEMO-') && <p className="text-secondary small mb-2">Sample listing · details and rate are editable by an administrator</p>}
        <div className="d-flex flex-wrap gap-2 text-secondary small mb-3">
          <span className="badge text-bg-light">{vehicle.transmission}</span>
          <span className="badge text-bg-light">{vehicle.fuelType}</span>
          <span className="badge text-bg-light">{vehicle.seatingCapacity} seats</span>
        </div>

        <div className="d-flex justify-content-between align-items-end gap-2 mt-auto">
          <div>
            <small className="d-block text-secondary">From</small>
            <strong className="fs-5">Rs. {vehicle.pricePerDay}/day</strong>
          </div>
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <Link to={`/vehicles/${vehicle.id}`} className="btn btn-outline-secondary btn-sm">
              View Details
            </Link>
            {bookingAllowed && <Link to={user ? bookingPath : '/login'} state={user ? undefined : { returnTo: bookingPath }} className="btn btn-success btn-sm">Rent Now</Link>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleCard
