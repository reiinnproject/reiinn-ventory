/**
 * MongoDB URI helper - fixes SRV DNS resolution on Windows.
 * Node.js uses c-ares on Windows which can fail; we force Cloudflare/Google DNS.
 */

import { platform } from 'os'
import dns from 'node:dns'

// Windows: Node.js c-ares resolver often fails for SRV/getaddrinfo.
// Force public DNS and IPv4-first (per MongoDB/Node.js troubleshooting).
if (platform() === 'win32') {
  dns.setServers(['1.1.1.1', '8.8.8.8'])
  dns.setDefaultResultOrder('ipv4first')
}

/**
 * Get MongoDB URI. MONGODB_URI_STANDARD overrides when set (for Windows ENOTFOUND).
 * On Windows: DNS fix + family:4 applied; use SRV. If still failing, set MONGODB_URI_STANDARD.
 * @returns {string}
 */
export function getMongoUri() {
  const uri = process.env.MONGODB_URI
  if (!uri) return uri

  // Manual override: use standard URI from Atlas UI when SRV/getaddrinfo still fails
  if (process.env.MONGODB_URI_STANDARD) {
    return process.env.MONGODB_URI_STANDARD
  }

  // On Windows: keep SRV format; DNS fix (setServers + ipv4first) + family:4 should resolve it.
  // If you still get querySrv ECONNREFUSED or ENOTFOUND, set MONGODB_URI_STANDARD in .env.local.
  return uri
}

/**
 * MongoClient options for Windows (IPv4 + DNS) and serverless (fail-fast).
 * @returns {import('mongodb').MongoClientOptions}
 */
export function getMongoClientOptions() {
  const opts = {
    // Serverless: fail fast instead of hanging 30s on connection issues
    serverSelectionTimeoutMS: 10000,
  }
  if (platform() === 'win32') {
    opts.family = 4
  }
  return opts
}
