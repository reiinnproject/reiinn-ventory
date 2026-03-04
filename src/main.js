// Login page - Phase 1: temporary hardcoded auth (will use API in Phase 6)
// Expose to window so onclick="login()" in HTML can find it (ES modules are scoped)
window.login = function login() {
  const user = document.getElementById('userInput').value
  const pass = document.getElementById('passInput').value
  const err = document.getElementById('err')

  if (user === 'admin' && pass === 'admin123') {
    sessionStorage.setItem('rei_user', JSON.stringify({ role: 'admin' }))
    window.location.href = '/app.html'
  } else if (user === 'staff' && pass === 'staff123') {
    sessionStorage.setItem('rei_user', JSON.stringify({ role: 'staff' }))
    window.location.href = '/app.html'
  } else {
    err.style.display = 'block'
  }
}
