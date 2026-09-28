import { useCallback, useEffect, useState } from 'react'
import { api, allPages } from './api'
export default function useApi(path, paged = false) {
  const [state, setState] = useState({ path: null, data: null, error: '', loading: true })
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion(value => value + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    const request = paged ? allPages(path, controller.signal) : api(path, { signal: controller.signal })
    request.then(data => setState({ path, data, error: '', loading: false }))
      .catch(error => { if (error.name !== 'AbortError') setState({ path, data: null, error: error.message, loading: false }) })
    return () => controller.abort()
  }, [path, paged, version])
  return { ...state, loading: state.path !== path || state.loading, reload }
}
