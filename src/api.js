/**
 * API client - fetch wrapper with Authorization header
 */

import { getToken } from './auth.js'

function headers(custom = {}) {
  const h = {
    'Content-Type': 'application/json',
    ...custom,
  }
  const token = getToken()
  if (token) {
    h['Authorization'] = `Bearer ${token}`
  }
  return h
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = new Error(res.statusText || `HTTP ${res.status}`)
    err.status = res.status
    try {
      err.body = await res.json()
    } catch {
      err.body = await res.text()
    }
    throw err
  }
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const api = {
  async get(url) {
    const res = await fetch(url, {
      method: 'GET',
      headers: headers(),
    })
    return handleResponse(res)
  },

  async post(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse(res)
  },

  async put(url, body) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return handleResponse(res)
  },

  async delete(url) {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: headers(),
    })
    return handleResponse(res)
  },
}
