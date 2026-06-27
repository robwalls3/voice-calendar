import { describe, it, expect, beforeAll } from 'bun:test'

const BASE_URL = 'http://localhost:3001'

async function post(path: string, body: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return { status: res.status, body: await res.json() }
}

async function get(path: string) {
  const res = await fetch(`${BASE_URL}${path}`)
  return { status: res.status, body: await res.json() }
}

async function del(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE' })
  return { status: res.status, body: await res.json() }
}

describe('health', () => {
  it('returns ok', async () => {
    const { status, body } = await get('/health')
    expect(status).toBe(200)
    expect(body.status).toBe('ok')
  })
})

describe('entries', () => {
  let createdId: number

  it('gets all entries', async () => {
    const { status, body } = await get('/entries')
    expect(status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  it('gets entries by month', async () => {
    const { status, body } = await get('/entries/month/2026-06')
    expect(status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  it('returns 400 for invalid id', async () => {
    const { status } = await get('/entries/abc')
    expect(status).toBe(400)
  })

  it('returns 404 for missing entry', async () => {
    const { status } = await get('/entries/999999')
    expect(status).toBe(404)
  })
})

describe('parse', () => {
  it('parses text into structured entry', async () => {
    const { status, body } = await post('/parse', {
      text: 'Daisy sneezed this morning'
    })
    expect(status).toBe(200)
    expect(body.subject).toBe('daisy')
    expect(body.event).toBeTruthy()
    expect(body.date).toBeTruthy()
  })

  it('returns 400 with no text', async () => {
    const { status } = await post('/parse', {})
    expect(status).toBe(400)
  })
})

describe('parse/save', () => {
  let createdId: number

  it('parses and saves an entry', async () => {
    const { status, body } = await post('/parse/save', {
      text: 'Rob felt anxious this afternoon'
    })
    expect(status).toBe(201)
    expect(body.subject).toBe('rob')
    expect(body.event).toBeTruthy()
    expect(body.date).toBeTruthy()
    createdId = body.id
  })

  it('cleans up test entry', async () => {
    const { status } = await del(`/entries/${createdId}`)
    expect(status).toBe(200)
  })

  it('returns 400 with no text', async () => {
    const { status } = await post('/parse/save', {})
    expect(status).toBe(400)
  })
})