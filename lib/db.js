/**
 * MongoDB connection helper for Vercel Serverless
 * Uses connection caching (serverless-friendly)
 */

import { config } from 'dotenv'
import { join } from 'path'
import { MongoClient } from 'mongodb'

// Load .env.local for vercel dev (doesn't always auto-load)
config({ path: join(process.cwd(), '.env.local') })
config({ path: join(process.cwd(), '.env') })

let cached = global.mongo
if (!cached) cached = global.mongo = { conn: null, promise: null }

export async function getDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = MongoClient.connect(uri).then((client) => {
      return { client, db: client.db() }
    })
  }

  const { client, db } = await cached.promise
  cached.conn = db
  return db
}
