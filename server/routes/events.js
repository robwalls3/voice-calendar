import { Router } from 'express'
import { db } from '../database.js'

const router = Router()

// GET all events
router.get('/', (req, res) => {
  const events = db.prepare(`
    SELECT * FROM events ORDER BY date DESC, time ASC
  `).all()
  res.json(events)
})

// GET events by month e.g. /events/month/2026-06
router.get('/month/:month', (req, res) => {
  const events = db.prepare(`
    SELECT * FROM events WHERE date LIKE ? ORDER BY date ASC, time ASC
  `).all(`${req.params.month}%`)
  res.json(events)
})

// GET single event
router.get('/:id', (req, res) => {
  const event = db.prepare(`
    SELECT * FROM events WHERE id = ?
  `).get(req.params.id)
  if (!event) return res.status(404).json({ error: 'Event not found' })
  res.json(event)
})

// POST new event (structured JSON from LLM)
router.post('/', (req, res) => {
  const { title, date, time, duration_minutes, notes, category, raw_input } = req.body

  if (!title || !date) {
    return res.status(400).json({ error: 'title and date are required' })
  }

  const result = db.prepare(`
    INSERT INTO events (title, date, time, duration_minutes, notes, category, raw_input)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, date, time, duration_minutes, notes, category, raw_input)

  res.status(201).json({ id: result.lastInsertRowid, message: 'Event created' })
})

// DELETE event
router.delete('/:id', (req, res) => {
  db.prepare(`DELETE FROM events WHERE id = ?`).run(req.params.id)
  res.json({ message: 'Event deleted' })
})

export default router