export default function PathCard({ path }) {
  return (
    <article className="bg-white p-4 rounded-md shadow">
      <h3 className="text-xl font-semibold text-sky-900">{path.title}</h3>
      <div className="text-sm text-sky-600">Level: {path.level} • Duration: {path.duration_weeks} weeks</div>
      <ol className="mt-3 space-y-3">
        {path.steps?.map((s, i) => (
          <li key={i} className="border-l-2 border-sky-200 pl-3">
            <div className="font-medium">{s.title} <span className="text-xs text-sky-500">({s.estimated_time_hours || '—'} hrs)</span></div>
            <div className="text-sm text-sky-700">{s.description}</div>
            {s.resources?.length > 0 && (
              <ul className="text-xs mt-1">
                {s.resources.map((r, idx) => (
                  <li key={idx}><a className="underline" href={r.url} target="_blank" rel="noreferrer">{r.name}</a></li>
                ))}
              </ul>
            )}
            {s.why && <div className="text-xs text-sky-500 mt-1">Why: {s.why}</div>}
          </li>
        ))}
      </ol>
    </article>
  )
}
