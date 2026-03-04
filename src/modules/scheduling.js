/**
 * Scheduling module - add, edit, delete calendar events
 * Uses localStorage until API is available (Phase 6)
 */

const STORAGE_KEY = 'rei_sched'

function getSchedules() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

function saveSchedules(schedules) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
}

let editIdx = -1

function renderList() {
  const body = document.getElementById('schedHistoryBody')
  const btn = document.getElementById('schedBtn')
  if (!body) return

  const schedules = getSchedules()

  function escapeHtml(s) {
    const div = document.createElement('div')
    div.textContent = s
    return div.innerHTML
  }

  body.innerHTML = schedules
    .map(
      (s, idx) =>
        `<tr>
          <td><b>${escapeHtml(s.title || '')}</b></td>
          <td>${escapeHtml(s.date || '')}</td>
          <td>${escapeHtml(s.notes || '')}</td>
          <td>
            <button class="btn-edit" data-edit-idx="${idx}">✎</button>
            <button class="btn-del" data-del-idx="${idx}">X</button>
          </td>
        </tr>`
    )
    .join('')

  body.querySelectorAll('[data-edit-idx]').forEach((el) => {
    el.addEventListener('click', () => editSchedule(parseInt(el.dataset.editIdx, 10)))
  })

  body.querySelectorAll('[data-del-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.delIdx, 10)
      if (confirm('Delete schedule?')) {
        const schedules = getSchedules()
        schedules.splice(idx, 1)
        saveSchedules(schedules)
        editIdx = -1
        resetForm()
        renderList()
      }
    })
  })

  if (btn) btn.textContent = editIdx >= 0 ? 'Update Entry' : '+ Add to Calendar'
}

function addOrUpdateSchedule() {
  const title = document.getElementById('schedTitle')?.value?.trim()
  const date = document.getElementById('schedDate')?.value
  const notes = document.getElementById('schedNote')?.value?.trim()

  if (!title || !date) return

  const schedules = getSchedules()

  if (editIdx >= 0) {
    schedules[editIdx] = { title, date, notes }
    editIdx = -1
  } else {
    schedules.push({ title, date, notes })
  }

  saveSchedules(schedules)
  resetForm()
  renderList()
}

function editSchedule(idx) {
  const schedules = getSchedules()
  const s = schedules[idx]
  if (!s) return

  const titleEl = document.getElementById('schedTitle')
  const dateEl = document.getElementById('schedDate')
  const noteEl = document.getElementById('schedNote')
  const btn = document.getElementById('schedBtn')

  if (titleEl) titleEl.value = s.title || ''
  if (dateEl) dateEl.value = s.date || ''
  if (noteEl) noteEl.value = s.notes || ''
  if (btn) btn.textContent = 'Update Entry'

  editIdx = idx
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetForm() {
  ;['schedTitle', 'schedDate', 'schedNote'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })
  const btn = document.getElementById('schedBtn')
  if (btn) btn.textContent = '+ Add to Calendar'
}

function bindEvents() {
  document.getElementById('schedBtn')?.addEventListener('click', addOrUpdateSchedule)
}

export function init() {
  editIdx = -1
  resetForm()
  renderList()
  bindEvents()
}
