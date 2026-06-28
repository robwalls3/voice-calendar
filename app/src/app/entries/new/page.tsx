'use client'

import { useEffect, useState } from 'react'
import { createEntry, getSubjects } from '@/lib/api'
import { Subject } from '@/lib/db/schema'

export default function AddEntryPage() {
  const [loading, setLoading] = useState(false)

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [form, setForm] = useState({
    subjectId: 1,
    event: '',
    date: '',
    time: '',
    notes: '',
  })

  useEffect(() => {
    getSubjects().then(setSubjects)
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await createEntry(form)
      alert('Entry created')
      setForm({
        subjectId: 1,
        event: '',
        date: '',
        time: '',
        notes: '',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Add Entry</h1>

      <form onSubmit={onSubmit}>
        <select
          value={form.subjectId}
          onChange={(e) =>
            setForm({ ...form, subjectId: Number(e.target.value) })
          }
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Event"
          value={form.event}
          onChange={(e) =>
            setForm({ ...form, event: e.target.value })
          }
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        <input
          placeholder="Time"
          value={form.time}
          onChange={(e) =>
            setForm({ ...form, time: e.target.value })
          }
        />

        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) =>
            setForm({ ...form, notes: e.target.value })
          }
        />

        <button disabled={loading}>
          {loading ? 'Saving...' : 'Add Entry'}
        </button>
      </form>
    </div>
  )
}