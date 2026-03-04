/**
 * Notifications - bell dropdown, badge, clear.
 * Uses localStorage (rei_notifs) until API is available.
 */

const STORAGE_KEY = 'rei_notifs'

function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveNotifications(notifications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

export function getNotificationsForRole(role) {
  return getNotifications().filter((n) => n.for === role)
}

export function addNotification(msg, targetRole) {
  const notifications = getNotifications()
  notifications.unshift({
    msg,
    for: targetRole,
    read: false,
    time: new Date().toLocaleTimeString(),
  })
  saveNotifications(notifications)
  updateNotifUI()
}

function getCurrentRole() {
  try {
    const user = JSON.parse(sessionStorage.getItem('rei_user') || 'null')
    return user?.role || 'staff'
  } catch {
    return 'staff'
  }
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
            `<div class="notif-item" style="background:${n.read ? 'transparent' : '#f0f7ff'}">${n.msg}<br><small style="color:#94a3b8">${n.time}</small></div>`
        )
        .join('')
    : '<div class="notif-item">No notifications</div>'
}

function clearBadge() {
  const badge = document.getElementById('notif-badge')
  if (badge) badge.style.display = 'none'

  const role = getCurrentRole()
  const notifications = getNotifications()
  notifications.forEach((n) => {
    if (n.for === role) n.read = true
  })
  saveNotifications(notifications)
}

function clearAllNotifs() {
  const role = getCurrentRole()
  const notifications = getNotifications().filter((n) => n.for !== role)
  saveNotifications(notifications)
  updateNotifUI()
}

function toggleNotifs() {
  const dd = document.getElementById('notif-dropdown')
  if (!dd) return
  const isOpen = dd.style.display === 'block'
  dd.style.display = isOpen ? 'none' : 'block'
  if (!isOpen) clearBadge()
}

export function initNotifications() {
  updateNotifUI()

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

export { updateNotifUI }
