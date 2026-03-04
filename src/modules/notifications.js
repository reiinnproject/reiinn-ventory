/**
 * Notifications - bell dropdown, badge, clear.
 * Uses API (MongoDB) for cross-device sync.
 */

import { api } from '../api.js'

let notificationsCache = []
let pollInterval = null

function getCurrentRole() {
  try {
    const user = JSON.parse(sessionStorage.getItem('rei_user') || 'null')
    return user?.role || 'staff'
  } catch {
    return 'staff'
  }
}

async function fetchNotifications() {
  try {
    const list = await api.get('/api/notifications')
    notificationsCache = Array.isArray(list) ? list : []
  } catch {
    notificationsCache = []
  }
}

export function getNotificationsForRole(role) {
  return notificationsCache.filter((n) => n.for === role)
}

function showToast(message, type = 'error') {
  const existing = document.getElementById('notif-toast')
  if (existing) existing.remove()
  const toast = document.createElement('div')
  toast.id = 'notif-toast'
  toast.textContent = message
  toast.style.cssText = `position:fixed;bottom:20px;right:20px;padding:12px 20px;background:${type === 'error' ? '#dc2626' : '#16a34a'};color:white;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15);`
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}

export async function addNotification(msg, targetRole) {
  try {
    await api.post('/api/notifications', { msg, for: targetRole })
    await refreshAndUpdate()
  } catch (err) {
    console.warn('Failed to add notification:', err)
    showToast('Could not send notification. Check connection.')
  }
}

async function refreshAndUpdate() {
  await fetchNotifications()
  updateNotifUI()
}

function updateNotifUI() {
  const list = document.getElementById('notif-list')
  const badge = document.getElementById('notif-badge')
  if (!list || !badge) return

  const role = getCurrentRole()
  const myNotifs = getNotificationsForRole(role)
  const unread = myNotifs.filter((n) => !n.read).length

  if (unread > 0) {
    badge.textContent = unread
    badge.style.display = 'block'
  } else {
    badge.style.display = 'none'
  }

  list.innerHTML = myNotifs.length
    ? myNotifs
        .map(
          (n) =>
            `<div class="notif-item" style="background:${n.read ? 'transparent' : '#f0f7ff'}">${n.msg}<br><small style="color:#94a3b8">${n.time || ''}</small></div>`
        )
        .join('')
    : '<div class="notif-item">No notifications</div>'
}

async function clearBadge() {
  const badge = document.getElementById('notif-badge')
  if (badge) badge.style.display = 'none'

  try {
    await api.put('/api/notifications')
    await refreshAndUpdate()
  } catch {
    // Fallback: just update UI from cache
    updateNotifUI()
  }
}

async function clearAllNotifs() {
  try {
    await api.delete('/api/notifications')
    await refreshAndUpdate()
  } catch (err) {
    console.warn('Failed to clear notifications:', err)
  }
}

function toggleNotifs() {
  const dd = document.getElementById('notif-dropdown')
  if (!dd) return
  const isOpen = dd.style.display === 'block'
  dd.style.display = isOpen ? 'none' : 'block'
  if (!isOpen) clearBadge()
}

function startPolling() {
  if (pollInterval) return
  pollInterval = setInterval(async () => {
    await refreshAndUpdate()
  }, 5000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    refreshAndUpdate()
  }
}

function onRouteChange() {
  const hash = window.location.hash.slice(2) || 'dashboard'
  const route = hash === 'inventory' ? 'inventory-list' : hash
  if (route === 'dashboard' || route === 'gatepass') {
    refreshAndUpdate()
  }
}

export async function initNotifications() {
  await refreshAndUpdate()
  startPolling()

  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('hashchange', onRouteChange)

  document.getElementById('notifWrapper')?.addEventListener('click', (e) => {
    e.stopPropagation()
    toggleNotifs()
  })

  document.getElementById('notifClearAll')?.addEventListener('click', () => {
    clearAllNotifs()
  })

  document.addEventListener('click', () => {
    const dd = document.getElementById('notif-dropdown')
    if (dd) dd.style.display = 'none'
  })
}

export { updateNotifUI, refreshAndUpdate }
