// Main app - Phase 1: auth guard, router stub, clock
const ROUTES = ['dashboard', 'inventory', 'scheduling', 'deliveries', 'procurement', 'gatepass', 'deployment']

function init() {
  const user = sessionStorage.getItem('rei_user')
  if (!user) {
    window.location.href = '/'
    return
  }

  document.getElementById('login-screen')?.remove()
  document.getElementById('main-app').style.display = 'flex'
  document.getElementById('live-clock').style.display = 'block'

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
      area.innerHTML = `<h1>${route}</h1><p>View coming in Phase 2.</p>`
    }
  } catch {
    area.innerHTML = `<h1>${route}</h1><p>View coming in Phase 2.</p>`
  }
}

init()
