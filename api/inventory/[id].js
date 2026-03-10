/**
 * /api/inventory/[id] - Update inventory item
 * PUT: update item (admin only)
 */

import { getDb } from '../../lib/db.js'
import { ObjectId } from 'mongodb'

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

  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' })
    return
  }

  let id = req.query?.id
  if (!id && req.url) {
    const match = req.url.match(/\/api\/inventory\/([^/?]+)/)
    id = match ? match[1] : null
  }
  if (!id) {
    res.status(400).json({ error: 'id required' })
    return
  }

  try {
    const db = await getDb()
    const collection = db.collection('inventory')

    if (req.method === 'PUT') {
      const body = req.body || {}
      const update = {}
      if (body.desc !== undefined) update.desc = body.desc
      if (body.stock !== undefined) update.stock = body.stock
      if (body.name !== undefined) update.name = body.name
      if (body.loc !== undefined) update.loc = body.loc
      if (body.bal !== undefined) update.bal = body.bal
      if (body.col !== undefined) update.col = body.col
      if (body.cat !== undefined) update.cat = body.cat
      if (Object.keys(update).length === 0) {
        res.status(400).json({ error: 'No update fields' })
        return
      }
      const doc = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: 'after' }
      )
      if (!doc) {
        res.status(404).json({ error: 'Not found' })
        return
      }
      res.status(200).json(doc)
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Inventory [id] API error:', err)
    res.status(500).json({ error: err.message || 'Server error' })
  }
}
