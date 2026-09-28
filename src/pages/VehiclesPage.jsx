import { useMemo, useState } from 'react'
import VehicleCard from '../components/VehicleCard'
import { vehicleView } from '../api'
import useApi from '../useApi'
import RequestState from '../components/RequestState'

const categories = ['All', 'Economy', 'Sedan', 'SUV', 'Luxury', 'Van', 'Electric']
const sortOptions = [
  { value: 'default', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Vehicle' },
  { value: 'oldest', label: 'Oldest Vehicle' },
]

function VehiclesPage() {
  const request = useApi('/vehicles', true)
  const vehicles = useMemo(() => (request.data || []).map(vehicleView), [request.data])
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [filters, setFilters] = useState({ brand: '', transmission: '', fuelType: '', seatingCapacity: '', availability: '' })

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const min = Number(minPrice) || 0
    const max = maxPrice === '' ? Number.POSITIVE_INFINITY : Number(maxPrice)

    let result = vehicles.filter((vehicle) => {
      const matchesQuery =
        !normalizedQuery ||
        vehicle.brand.toLowerCase().includes(normalizedQuery) ||
        vehicle.model.toLowerCase().includes(normalizedQuery) ||
        vehicle.registrationNumber.toLowerCase().includes(normalizedQuery)

      const matchesCategory =
        selectedCategory === 'All' || vehicle.category.toLowerCase() === selectedCategory.toLowerCase()

      const matchesPrice = vehicle.pricePerDay >= min && vehicle.pricePerDay <= max

      const matchesExtra = ['brand', 'transmission', 'fuelType', 'seatingCapacity'].every(key => !filters[key] || String(vehicle[key]) === filters[key])
      const matchesAvailability = !filters.availability || vehicle.available === (filters.availability === 'available')
      return matchesQuery && matchesCategory && matchesPrice && matchesExtra && matchesAvailability
    })

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.pricePerDay - b.pricePerDay)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.pricePerDay - a.pricePerDay)
        break
      case 'newest':
        result = [...result].sort((a, b) => b.year - a.year)
        break
      case 'oldest':
        result = [...result].sort((a, b) => a.year - b.year)
        break
      default:
        result = [...result]
    }

    return result
  }, [vehicles, query, selectedCategory, minPrice, maxPrice, sortBy, filters])

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <div>
          <span className="badge text-bg-info mb-2">Available now</span>
          <h2 className="h3 mb-0">Browse vehicles</h2>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body row g-3">
        <div className="col-12 col-lg-4">
          <label className="form-label" htmlFor="vehicle-search">Search</label>
          <input
            className="form-control"
            id="vehicle-search"
            type="text"
            placeholder="Search brand, model, or registration"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="col-6 col-lg-2">
          <label className="form-label" htmlFor="category-filter">Category</label>
          <select
            className="form-select"
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 col-lg-2">
          <label className="form-label" htmlFor="min-price">Min Price</label>
          <input
            className="form-control"
            id="min-price"
            type="number"
            min="0"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div className="col-6 col-lg-2">
          <label className="form-label" htmlFor="max-price">Max Price</label>
          <input
            className="form-control"
            id="max-price"
            type="number"
            min="0"
            placeholder="200"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="col-6 col-lg-2">
          <label className="form-label" htmlFor="sort-by">Sort by</label>
          <select className="form-select" id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>

      <div className="row g-3">
        {[['brand', 'Brand'], ['transmission', 'Transmission'], ['fuelType', 'Fuel type'], ['seatingCapacity', 'Seats']].map(([key, label]) => <label className="col-sm-6 col-lg-2" key={key}>{label}<select className="form-select" value={filters[key]} onChange={e => setFilters({ ...filters, [key]: e.target.value })}><option value="">All</option>{[...new Set(vehicles.map(vehicle => String(vehicle[key])))].sort().map(value => <option key={value}>{value}</option>)}</select></label>)}
        <label className="col-sm-6 col-lg-2">Availability<select className="form-select" value={filters.availability} onChange={e => setFilters({ ...filters, availability: e.target.value })}><option value="">All</option><option value="available">Available</option><option value="unavailable">Unavailable</option></select></label>
      </div>
      <RequestState {...request} />
      <div className="text-secondary">
        <strong>{filteredVehicles.length}</strong> vehicles found
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        {request.loading || request.error ? null : filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => <div className="col" key={vehicle.id}><VehicleCard vehicle={vehicle} /></div>)
        ) : (
          <div className="col-12"><div className="alert alert-secondary">No vehicles match your current search and filters.</div></div>
        )}
      </div>
    </div>
  )
}

export default VehiclesPage
