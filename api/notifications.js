/**
 * /api/notifications - Notifications CRUD
 * GET: list notifications for current user's role (auth required)
 * POST: create notification (auth required)
 * PUT: mark all as read for current user's role (auth required)
 * DELETE: remove all for current user's role (auth required)
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

  const role = user.role || 'staff'

  try {
    const db = await getDb()
    const collection = db.collection('notifications')

    if (req.method === 'GET') {
      const items = await collection
        .find({ for: role })
        .sort({ _id: -1 })
        .toArray()
      res.status(200).json(items)
      return
    }

    if (req.method === 'POST') {
      const body = req.body || {}
      const doc = {
        msg: body.msg || '',
        for: body.for || role,
        read: false,
        time: new Date().toLocaleTimeString(),
      }
      await collection.insertOne(doc)
      res.status(201).json({ ok: true })
      return
    }

    if (req.method === 'PUT') {
      await collection.updateMany({ for: role }, { $set: { read: true } })
      res.status(200).json({ ok: true })
      return
    }

    if (req.method === 'DELETE') {
      await collection.deleteMany({ for: role })
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Notifications API error:', err)
    res.status(500).json({ error: err.message || 'Server error' })
  }
}
