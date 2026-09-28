export default function RequestState({ loading, error, reload }) {
  if (loading) return <p role="status" className="text-secondary py-4">Loading…</p>
  if (error) return <div role="alert" className="alert alert-danger">{error} {reload && <button className="btn btn-sm btn-outline-danger" onClick={reload}>Try again</button>}</div>
  return null
}
