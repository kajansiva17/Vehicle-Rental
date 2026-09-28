import { Link } from 'react-router-dom'
import VehicleCard from '../components/VehicleCard'
import { vehicleView } from '../api'
import useApi from '../useApi'
import RequestState from '../components/RequestState'

function HomePage() {
  const request = useApi('/vehicles?available=true', true)
  const featuredVehicles = (request.data || []).slice(0, 3).map(vehicleView)

  return (
    <div className="d-flex flex-column gap-5">
      <section className="hero-section rounded-4 border p-4 p-lg-5 row align-items-center g-4">
        <div className="col-lg-7">
          <span className="badge text-bg-info mb-3">Smart mobility for every trip</span>
          <h1 className="display-5 fw-bold">Rent premium vehicles with ease.</h1>
          <p className="lead text-secondary">
            From city commutes to family adventures, choose the right vehicle for your
            schedule and budget.
          </p>
          <div className="d-flex flex-wrap gap-2 mt-4">
            <Link to="/vehicles" className="btn btn-primary">
              Explore Fleet
            </Link>
            <Link to="/booking" className="btn btn-secondary">
              Book a Ride
            </Link>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card bg-dark text-white shadow">
            <div className="card-body d-grid gap-3">
              <div className="border-bottom border-secondary pb-3">
                <strong className="fs-2 d-block">{request.data?.length ?? '?'}</strong>
                <span>Vehicles</span>
              </div>
              <div className="border-bottom border-secondary pb-3">
                <strong className="fs-2 d-block">Your choice</strong>
                <span>Find the right vehicle</span>
              </div>
              <div>
                <strong className="fs-2 d-block">Easy booking</strong>
                <span>Manage your rentals online</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="d-flex justify-content-between align-items-end gap-3 mb-3">
          <div>
            <span className="badge text-bg-info mb-2">Popular choices</span>
            <h2 className="h3 mb-0">Featured vehicles</h2>
          </div>
          <Link to="/vehicles" className="text-link">
            Browse all vehicles
          </Link>
        </div>

        <RequestState {...request} />
        {!request.loading && !request.error && !featuredVehicles.length && <p className="text-secondary">No vehicles have been listed yet. Please check back soon.</p>}
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          {featuredVehicles.map((vehicle) => (
            <div className="col" key={vehicle.id}><VehicleCard vehicle={vehicle} /></div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
