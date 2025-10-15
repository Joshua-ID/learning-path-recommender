import { useState } from 'react'
import SkillForm from '../components/SkillForm'
import PathCard from '../components/PathCard'

export default function Home() {
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleRecommend(payload) {
    setLoading(true)
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        setPaths(data.paths || [])
      } else {
        alert(data.error || 'Recommendation failed')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sky-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-sky-900">Learning Path Recommender</h1>
          <p className="mt-2 text-sky-700">Tell the app your skills and goals — get a tailored roadmap.</p>
        </header>

        <SkillForm onRecommend={handleRecommend} loading={loading} />

        <section className="mt-8 grid gap-4">
          {paths.length === 0 && (
            <div className="text-sky-600">No recommendations yet — try submitting your skills.</div>
          )}
          {paths.map((p, i) => (
            <PathCard key={i} path={p} />
          ))}
        </section>
      </div>
    </div>
  )
}
