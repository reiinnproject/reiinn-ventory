// Main app - auth guard, router, clock, modal
import { logout, getUser, isAuthenticated } from './auth.js'

const ROUTES = ['dashboard', 'inventory-list', 'inventory-registry', 'scheduling', 'deliveries', 'procurement', 'gatepass', 'deployment']

const MODULES = {
  dashboard: () => import('./modules/dashboard.js'),
  'inventory-list': () => import('./modules/inventory.js'),
  'inventory-registry': () => import('./modules/inventory.js'),
  scheduling: () => import('./modules/scheduling.js'),
  deliveries: () => import('./modules/deliveries.js'),
  procurement: () => import('./modules/procurement.js'),
  gatepass: () => import('./modules/gatepass.js'),
  deployment: () => import('./modules/deployment.js'),
}

window.openModal = function (title, content) {
  const modal = document.getElementById('descModal')
  const titleEl = document.getElementById('modalTitle')
  const contentEl = document.getElementById('fullDescText')
  if (modal && titleEl && contentEl) {
    titleEl.textContent = title
    contentEl.innerHTML = content || '(No description)'
    modal.style.display = 'flex'
  }
}

async function initNotifications() {
  const { initNotifications } = await import('./modules/notifications.js')
  await initNotifications()
}

function toggleAdminElements() {
  const user = getUser()
  const isAdmin = user?.role === 'admin'
  document.querySelectorAll('.admin-only').forEach((el) => {
    el.style.display = isAdmin ? (el.tagName === 'TH' || el.tagName === 'TD' ? 'table-cell' : 'block') : 'none'
  })
}

async function init() {
  if (!isAuthenticated() || !getUser()) {
    window.location.replace('/')
    return
  }

  document.getElementById('login-screen')?.remove()
  document.getElementById('main-app').style.display = 'flex'
  document.getElementById('live-clock').style.display = 'block'

  document.getElementById('descModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'descModal') document.getElementById('descModal').style.display = 'none'
  })
  document.getElementById('modalClose')?.addEventListener('click', () => {
    document.getElementById('descModal').style.display = 'none'
  })

  updateClock()
  setInterval(updateClock, 1000)

  document.querySelector('.logout')?.addEventListener('click', logout)

  initMobileSidebar()
  updateUserRoleDisplay()
  await initNotifications()
  initRouter()
  initNav()
  toggleAdminElements()
}

function initMobileSidebar() {
  const btn = document.getElementById('btnHamburger')
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('sidebarOverlay')
  const mobileHeader = document.getElementById('mobileHeader')

  function openSidebar() {
    sidebar?.classList.add('open')
    overlay?.classList.add('visible')
    document.body.style.overflow = 'hidden'
  }

  function closeSidebar() {
    sidebar?.classList.remove('open')
    overlay?.classList.remove('visible')
    document.body.style.overflow = ''
  }

  btn?.addEventListener('click', () => {
    if (sidebar?.classList.contains('open')) closeSidebar()
    else openSidebar()
  })

  overlay?.addEventListener('click', closeSidebar)

  document.querySelectorAll('.menu-item[data-route], .sub-item[data-route]').forEach((el) => {
    el.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeSidebar()
    })
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeSidebar()
  })
}

function updateUserRoleDisplay() {
  const el = document.getElementById('user-role')
  if (!el) return
  const user = getUser()
  const role = user?.role || 'staff'
  el.textContent = role === 'admin' ? 'Administrator' : 'Staff'
  el.className = 'user-role role-' + role
}

function updateClock() {
  const now = new Date()
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: '2-digit' })
  const clockTime = document.getElementById('clock-time')
  const clockDate = document.getElementById('clock-date')
  if (clockTime) clockTime.textContent = time
  if (clockDate) clockDate.textContent = date
}

function initRouter() {
  let hash = window.location.hash.slice(2) || 'dashboard'
  if (hash === 'inventory') hash = 'inventory-list'
  const route = ROUTES.includes(hash) ? hash : 'dashboard'

  document.querySelectorAll('.menu-item').forEach((m) => {
    m.classList.toggle('active', m.getAttribute('data-route') === route)
  })
  document.querySelectorAll('.sub-item').forEach((m) => {
    m.classList.toggle('active', m.getAttribute('data-route') === route)
  })

  const invMenu = document.getElementById('inv-menu')
  const invSub = document.getElementById('inv-submenu')
  if (route === 'inventory-list' || route === 'inventory-registry') {
    invMenu?.classList.add('active', 'open')
    invSub?.classList.add('open')
  } else {
    invMenu?.classList.remove('open')
    invSub?.classList.remove('open')
  }

  loadView(route)
}

function initNav() {
  document.querySelectorAll('.menu-item[data-route]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const route = el.getAttribute('data-route')
      if (route === 'inventory') {
        e.stopPropagation()
        const invSub = document.getElementById('inv-submenu')
        const invMenu = document.getElementById('inv-menu')
        invSub?.classList.toggle('open')
        invMenu?.classList.toggle('open')
        return
      }
      window.location.hash = '#/' + route
    })
  })

  document.querySelectorAll('.sub-item[data-route]').forEach((el) => {
    el.addEventListener('click', () => {
      const route = el.getAttribute('data-route')
      window.location.hash = '#/' + route
    })
  })

  window.addEventListener('hashchange', () => initRouter())
}

async function loadView(route) {
  const area = document.getElementById('content-area')
  if (!area) return

  try {
    const res = await fetch(`/views/${route}.html`)
    if (res.ok) {
      area.innerHTML = await res.text()
    } else {
      area.innerHTML = `<h1>${route}</h1><p>View coming soon.</p>`
    }
  } catch {
    area.innerHTML = `<h1>${route}</h1><p>View coming soon.</p>`
  }

  const loadModule = MODULES[route]
  if (loadModule) {
    try {
      const mod = await loadModule()
      if (mod?.init) mod.init()
    } catch {
      // Module not implemented yet
    }
  }

  toggleAdminElements()
}

init().catch(() => {})
