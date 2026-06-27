import type { Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { entries } from '../../schema'
import { getAllEntries, getEntriesByMonth, getEntryById } from '../../lib/queries'
import type { Route } from '../../handler'

export const entriesRoute: Route = [
  {
    method: 'get',
    path: '/',
    handler: async (req: Request, res: Response) => {
      const result = await getAllEntries()
      res.json(result)
    }
  },
  {
    method: 'get',
    path: '/month/:month',
    handler: async (req: Request, res: Response) => {
      const { month } = req.params
      if (!month || typeof month !== 'string') return res.status(400).json({ error: 'invalid month' });
      if (!month) return res.status(400).json({ error: 'month is required' })
      const result = await getEntriesByMonth(month)
      res.json(result)
    }
  },
  {
    method: 'get',
    path: '/:id',
    handler: async (req: Request, res: Response) => {
      if (!req.params.id || typeof req.params.id !== 'string') return res.status(400).json({ error: 'invalid id' });

      const id = parseInt(req.params.id)
      if (isNaN(id)) return res.status(400).json({ error: 'invalid id' })
      const result = await getEntryById(id)
      if (!result) return res.status(404).json({ error: 'Entry not found' })
      res.json(result)
    }
  },
  {
    method: 'delete',
    path: '/:id',
    handler: async (req: Request, res: Response) => {
      if (!req.params.id || typeof req.params.id !== 'string') return res.status(400).json({ error: 'invalid id' });

      const id = parseInt(req.params.id)
      if (isNaN(id)) return res.status(400).json({ error: 'invalid id' })
      await db.delete(entries).where(eq(entries.id, id))
      res.json({ message: 'Entry deleted' })
    }
  }
]