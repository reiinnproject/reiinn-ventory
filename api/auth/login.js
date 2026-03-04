/**
 * POST /api/auth/login
 * Authenticates user against MongoDB users collection, returns JWT
 */

import { getDb } from '../../lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { username, password } = req.body || {}
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' })
      return
    }

    const db = await getDb()
    const user = await db.collection('users').findOne({
      username: username.trim(),
      password, // In production, use bcrypt hashing
    })

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const jwt = await import('jsonwebtoken')
    const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production'
    const token = jwt.default.sign(
      { userId: user._id.toString(), role: user.role },
      secret,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      token,
      user: { role: user.role, username: user.username },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: err.message || 'Login failed' })
  }
}
