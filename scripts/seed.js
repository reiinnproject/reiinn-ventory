#!/usr/bin/env node
/**
 * Seed MongoDB with initial users and optional sample data.
 * Run: npm run seed (requires MONGODB_URI in .env.local)
 */

import { MongoClient } from 'mongodb'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const paths = [
    join(process.cwd(), '.env.local'),
    join(process.cwd(), '.env'),
  ]
  for (const p of paths) {
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf8')
      for (const line of content.split(/\r?\n/)) {
        const m = line.match(/^([^#=]+)=(.*)$/)
        if (m) process.env[m[1].trim()] = m[2].trim().replace(/\r$/, '').replace(/^["']|["']$/g, '')
      }
      return
    }
  }
}

loadEnv()

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI not set. Create .env.local from .env.example and add your connection string.')
  process.exit(1)
}

const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'staff', password: 'staff123', role: 'staff' },
]

async function seed() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db()

    const usersCol = db.collection('users')
    // Delete existing seed users and recreate (ensures correct credentials)
    await usersCol.deleteMany({ username: { $in: users.map((u) => u.username) } })
    for (const u of users) {
      await usersCol.insertOne(u)
      console.log(`Created user: ${u.username} (${u.role})`)
    }

    const invCol = db.collection('inventory')
    const count = await invCol.countDocuments()
    if (count === 0) {
      await invCol.insertMany([
        { stock: 'STK001', name: 'Sample Item', desc: 'Demo item', loc: 'Warehouse A', bal: 10, col: 'Blue', cat: 'Equipment' },
      ])
      console.log('Added sample inventory item')
    }

    console.log('Seed complete.')
  } catch (err) {
    console.error('Seed failed:', err.message)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seed()
