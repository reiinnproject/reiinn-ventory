// Login page - authenticates against MongoDB via /api/auth/login

const MESSAGES = {
  emptyUsername: 'Please enter your username.',
  emptyPassword: 'Please enter your password.',
  invalidCredentials: 'Invalid username or password. Please try again.',
  serverError: 'Unable to connect. Make sure the server is running (npm run dev:full).',
  timeoutError: 'Request timed out. The server may be slow or unreachable. Please try again.',
  unknownError: 'Something went wrong. Please try again.',
}

function showMessage(el, text, type = 'error') {
  el.textContent = text
  el.className = `login-message ${type}`
  el.style.display = 'block'
}

function hideMessage(el) {
  el.textContent = ''
  el.className = 'login-message'
  el.style.display = 'none'
}

function setLoading(btn, loading) {
  btn.disabled = loading
  btn.classList.toggle('loading', loading)
}

function clearInputError(input) {
  input?.classList.remove('error')
}

function setInputError(input) {
  input?.classList.add('error')
}

const EYE_OFF = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
const EYE_OPEN = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'

function initPasswordToggle() {
  const toggle = document.getElementById('togglePassword')
  const input = document.getElementById('passInput')
  const svg = toggle?.querySelector('.icon-password')
  if (!toggle || !input || !svg) return

  function updateIcon() {
    const isVisible = input.type === 'text'
    svg.innerHTML = isVisible ? EYE_OPEN : EYE_OFF
    toggle.setAttribute('aria-pressed', isVisible)
    toggle.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password')
    toggle.setAttribute('title', isVisible ? 'Hide password' : 'Show password')
  }

  toggle.addEventListener('click', () => {
    const isVisible = input.type === 'text'
    input.type = isVisible ? 'password' : 'text'
    updateIcon()
  })
}

function initClearMessageOnInput() {
  const form = document.getElementById('loginForm')
  const message = document.getElementById('message')
  if (!form || !message) return

  form.addEventListener('input', () => {
    hideMessage(message)
    clearInputError(document.getElementById('userInput'))
    clearInputError(document.getElementById('passInput'))
  })
}

window.login = async function login(ev) {
  if (ev) ev.preventDefault()

  const userInput = document.getElementById('userInput')
  const passInput = document.getElementById('passInput')
  const message = document.getElementById('message')
  const btn = document.getElementById('btnLogin')

  const user = userInput?.value?.trim() ?? ''
  const pass = passInput?.value ?? ''

  hideMessage(message)
  clearInputError(userInput)
  clearInputError(passInput)

  if (!user) {
    showMessage(message, MESSAGES.emptyUsername)
    setInputError(userInput)
    userInput?.focus()
    return
  }

  if (!pass) {
    showMessage(message, MESSAGES.emptyPassword)
    setInputError(passInput)
    passInput?.focus()
    return
  }

  setLoading(btn, true)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      const { setToken, setUser } = await import('./auth.js')
      setToken(data.token)
      setUser(data.user)
      // Use replace to avoid back-button returning to login
      window.location.replace('/app.html')
      return
    }

    const msg = res.status === 401
      ? MESSAGES.invalidCredentials
      : (data.error || MESSAGES.unknownError)
    showMessage(message, msg)
    setInputError(userInput)
    setInputError(passInput)
    userInput?.focus()
  } catch (e) {
    const msg = e?.name === 'AbortError' ? MESSAGES.timeoutError : MESSAGES.serverError
    showMessage(message, msg)
  } finally {
    setLoading(btn, false)
  }
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle()
  initClearMessageOnInput()
})
