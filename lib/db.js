/**
 * MongoDB connection helper for Vercel Serverless
 * Uses connection caching (serverless-friendly)
 */

import { config } from 'dotenv'
import { join } from 'path'
import { MongoClient } from 'mongodb'
import { getMongoUri, getMongoClientOptions } from './mongodb-uri.js'

// Load .env.local for vercel dev (doesn't always auto-load)
config({ path: join(process.cwd(), '.env.local') })
config({ path: join(process.cwd(), '.env') })

let cached = global.mongo
if (!cached) cached = global.mongo = { conn: null, promise: null }

export async function getDb() {
  const uri = getMongoUri()
  if (!uri) throw new Error('MONGODB_URI is not set')

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const options = getMongoClientOptions()
    cached.promise = MongoClient.connect(uri, options).then((client) => {
      return { client, db: client.db() }
    })
  }

  const { client, db } = await cached.promise
  cached.conn = db
  return db
}
