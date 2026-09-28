import { useEffect, useState } from 'react'
import { api, tokenStore } from './api'
import { AuthContext } from './auth-context'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const expired = () => { setUser(null); setError('Your session has expired. Please log in again.') }
    window.addEventListener('session-expired', expired)
    const restore = async () => {
      try { if (tokenStore.get()) { const profile = await api('/users/me'); if (active) setUser(profile) } }
      catch (e) { if (active) setError(e.message) }
      finally { if (active) setLoading(false) }
    }
    restore()
    return () => { active = false; window.removeEventListener('session-expired', expired) }
  }, [])
  async function login(values) {
    const data = await api('/auth/login', { method: 'POST', body: values })
    tokenStore.set(data.access_token); setUser(data.user); setError('')
    return data.user
  }
  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    tokenStore.set(null); setUser(null)
  }
  return <AuthContext.Provider value={{ user, setUser, loading, error, login, logout }}>{children}</AuthContext.Provider>
}
