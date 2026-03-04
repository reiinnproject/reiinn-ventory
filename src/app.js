// Main app - auth guard, router, clock, modal
const ROUTES = ['dashboard', 'inventory', 'scheduling', 'deliveries', 'procurement', 'gatepass', 'deployment']

const MODULES = {
  dashboard: () => import('./modules/dashboard.js'),
  inventory: () => import('./modules/inventory.js'),
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
    contentEl.innerHTML = content
    modal.style.display = 'flex'
  }
}

function init() {
  const user = sessionStorage.getItem('rei_user')
  if (!user) {
    window.location.href = '/'
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

  initRouter()
  initNav()
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
  const hash = window.location.hash.slice(2) || 'dashboard'
  const route = ROUTES.includes(hash) ? hash : 'dashboard'
  document.querySelectorAll('.menu-item').forEach((m) => {
    m.classList.toggle('active', m.getAttribute('data-route') === route)
  })
  loadView(route)
}

function initNav() {
  document.querySelectorAll('.menu-item[data-route]').forEach((el) => {
    el.addEventListener('click', () => {
      const route = el.getAttribute('data-route')
      window.location.hash = route
      document.querySelectorAll('.menu-item').forEach((m) => m.classList.remove('active'))
      el.classList.add('active')
      loadView(route)
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
}

init()
