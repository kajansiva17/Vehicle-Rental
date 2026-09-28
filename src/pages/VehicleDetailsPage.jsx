import { Link, useParams } from 'react-router-dom'
import { vehicleView } from '../api'
import { useAuth } from '../auth-context'
import useApi from '../useApi'
import RequestState from '../components/RequestState'

function VehicleDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const request = useApi(`/vehicles/${id}`)
  const vehicle = request.data ? vehicleView(request.data) : null
  if (request.loading || request.error) return <RequestState {...request} />

  if (!vehicle) {
    return (
      <div className="text-center py-5">
        <h2>Vehicle Not Found</h2>
        <p>The vehicle you are looking for does not exist or is no longer available.</p>
        <Link to="/vehicles" className="btn btn-primary">
          Back to Vehicles
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="card shadow-sm row g-0 overflow-hidden">
        {vehicle.image && <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="details-image col-lg-6 img-fluid" />}

        <div className="col-lg-6 card-body p-4 p-lg-5">
          <span className="badge text-bg-info mb-2">{vehicle.category}</span>
          <h2 className="h3">
            {vehicle.brand} {vehicle.model}
          </h2>
          {vehicle.registrationNumber.startsWith('DEMO-') && <p className="text-secondary small">Sample listing. The administrator can edit the year, rate, registration, and other details.</p>}

          <div className="d-flex flex-wrap gap-2 my-3">
            <span className="badge text-bg-light">{vehicle.transmission}</span>
            <span className="badge text-bg-light">{vehicle.fuelType}</span>
            <span className="badge text-bg-light">{vehicle.seatingCapacity} seats</span>
            <span className="badge text-bg-light">{vehicle.year}</span>
          </div>

          <div className="d-flex align-items-baseline gap-2 mb-3">
            <strong className="fs-3">Rs. {vehicle.pricePerDay}</strong>
            <span>/ day</span>
          </div>

          <ul className="list-group list-group-flush mb-3">
            <li>
              <strong>Registration:</strong> {vehicle.registrationNumber}
            </li>
            <li>
              <strong>Color:</strong> {vehicle.color}
            </li>
            <li>
              <strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} km
            </li>
            <li>
              <strong>Status:</strong> {vehicle.available ? 'Available for rent' : 'Currently unavailable'}
            </li>
          </ul>

          <div className="d-flex flex-wrap gap-2">
            {vehicle.available && user?.role !== 'admin' && <Link to={user ? `/booking/${vehicle.id}` : '/login'} state={user ? undefined : { returnTo: `/booking/${vehicle.id}` }} className="btn btn-primary">Rent This Vehicle</Link>}
            <Link to="/vehicles" className="btn btn-outline-secondary">
              Back to Fleet
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleDetailsPage
