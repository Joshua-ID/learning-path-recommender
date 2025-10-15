import { useState } from 'react'

export default function SkillForm({ onRecommend, loading }) {
  const [skills, setSkills] = useState('')
  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('intermediate')

  function submit(e) {
    e.preventDefault()
    const payload = { skills: skills.split(',').map(s => s.trim()).filter(Boolean), goal, experience_level: level }
    onRecommend(payload)
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-sm">
      <div className="grid gap-4">
        <label className="block">
          <div className="text-sm text-sky-700">Current skills (comma-separated)</div>
          <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node, Docker" className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>

        <label className="block">
          <div className="text-sm text-sky-700">Career goal</div>
          <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Become a Senior Frontend Engineer" className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>

        <label className="block">
          <div className="text-sm text-sky-700">Experience level</div>
          <select value={level} onChange={e => setLevel(e.target.value)} className="mt-1 rounded-md border px-3 py-2">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="bg-sky-600 text-white px-4 py-2 rounded-md">
            {loading ? 'Generating…' : 'Generate Path'}
          </button>
          <button type="button" onClick={() => { setSkills(''); setGoal(''); setLevel('intermediate') }} className="text-sky-600">Reset</button>
        </div>
      </div>
    </form>
  )
}
