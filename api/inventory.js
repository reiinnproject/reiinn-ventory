/**
 * /api/inventory - CRUD for inventory items
 * GET: list items (optional ?q= search)
 * POST: add item (requires auth)
 * DELETE: remove item by _id (requires auth, admin only)
 */

import { getDb } from '../lib/db.js'
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

  try {
    const db = await getDb()
    const collection = db.collection('inventory')

    if (req.method === 'GET') {
      const q = (req.query?.q || '').toLowerCase()
      let cursor = collection.find({})
      const items = await cursor.toArray()

      const filtered = q
        ? items.filter(
            (i) =>
              (i.name || '').toLowerCase().includes(q) ||
              (i.stock || '').toLowerCase().includes(q)
          )
        : items

      res.status(200).json(filtered)
      return
    }

    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (req.method === 'POST') {
      if (user.role !== 'admin') {
        res.status(403).json({ error: 'Admin only' })
        return
      }
      const body = req.body || {}
      const doc = {
        stock: body.stock || '',
        name: body.name || '',
        desc: body.desc || '',
        loc: body.loc || '',
        bal: body.bal ?? '',
        col: body.col || '',
        cat: body.cat || '',
      }
      const result = await collection.insertOne(doc)
      res.status(201).json({ _id: result.insertedId, ...doc })
      return
    }

    if (req.method === 'DELETE') {
      if (user.role !== 'admin') {
        res.status(403).json({ error: 'Admin only' })
        return
      }
      const id = req.query?.id
      if (!id) {
        res.status(400).json({ error: 'id required' })
        return
      }
      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      if (result.deletedCount === 0) {
        res.status(404).json({ error: 'Not found' })
        return
      }
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Inventory API error:', err)
    res.status(500).json({ error: err.message || 'Server error' })
  }
}
