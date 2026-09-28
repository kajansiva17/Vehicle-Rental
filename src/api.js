const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
export const tokenStore = {
  get: () => sessionStorage.getItem('rental_token'),
  set: (token) => token ? sessionStorage.setItem('rental_token', token) : sessionStorage.removeItem('rental_token'),
}
export async function api(path, { method = 'GET', body, signal } = {}) {
  const token = tokenStore.get()
  let response
  try {
    response = await fetch(`${base}${path}`, {
      method, signal, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Cannot reach the server. Please check your connection and try again.', { cause: error })
  }
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401 && token) {
      tokenStore.set(null)
      window.dispatchEvent(new Event('session-expired'))
    }
    const detail = data?.detail
    const fallback = [502, 503, 504].includes(response.status)
      ? 'The API is unavailable. Check that the backend and database are running, then try again.'
      : `Request failed (${response.status})`
    throw new Error(Array.isArray(detail) ? detail.map(item => `${item.loc.at(-1)}: ${item.msg}`).join('; ') : detail || fallback)
  }
  return data
}
export async function allPages(path, signal) {
  const rows = []
  for (let offset = 0; ; offset += 100) {
    const page = await api(`${path}${path.includes('?') ? '&' : '?'}limit=100&offset=${offset}`, { signal })
    rows.push(...page)
    if (page.length < 100) return rows
  }
}
const originalImages = import.meta.glob('./assets/images/*', { eager: true, query: '?url', import: 'default' })
export const imageChoices = Object.entries(originalImages).map(([path, url]) => ({
  name: path.split('/').at(-1), value: `/vehicle-images/${path.split('/').at(-1)}`, url,
}))
export function vehicleView(vehicle) {
  const image = imageChoices.find(item => item.value === vehicle.image)?.url || vehicle.image || undefined
  return { ...vehicle, image, pricePerDay: Number(vehicle.price_per_day),
    registrationNumber: vehicle.registration_number, fuelType: vehicle.fuel_type,
    seatingCapacity: vehicle.seats, available: vehicle.is_available && vehicle.status === 'available' }
}
