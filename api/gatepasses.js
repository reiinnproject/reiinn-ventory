/**
 * /api/gatepasses - Gate pass CRUD
 * GET: list all gate passes (auth required)
 * POST: create gate pass (auth required)
 */

import { getDb } from '../lib/db.js'

async function getAuthUser(req) {
  const auth = req.headers?.authorization
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const jwt = await import('jsonwebtoken')
    const token = auth.slice(7)
    const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production'
    return jwt.default.verify(token, secret)
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  const user = await getAuthUser(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    const db = await getDb()
    const collection = db.collection('gatepasses')

    if (req.method === 'GET') {
      const items = await collection.find({}).sort({ _id: -1 }).toArray()
      res.status(200).json(items)
      return
    }

    if (req.method === 'POST') {
      const body = req.body || {}
      const doc = {
        requester: body.requester || '',
        loc: body.loc || '',
        date: body.date || '',
        return: body.return || '',
        items: Array.isArray(body.items) ? body.items : [],
        status: 'Undone',
      }
      const result = await collection.insertOne(doc)
      res.status(201).json({ _id: result.insertedId.toString(), ...doc })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Gatepasses API error:', err)
    res.status(500).json({ error: err.message || 'Server error' })
  }
}
