/**
 * Procurement module - project procurement tracking
 * Uses localStorage until API is available (Phase 6)
 */

import { getUser } from '../auth.js'

const STORAGE_KEY = 'rei_proc'
const STATUS_STATES = ['Pending', 'Approved', 'Completed']
const STATUS_COLORS = {
  Pending: '#fef9c3;color:#854d0e',
  Approved: '#dcfce7;color:#166534',
  Completed: '#dbeafe;color:#1e3a8a',
}

function getProcurements() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

function saveProcurements(procurements) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(procurements))
}

function isAdmin() {
  return getUser()?.role === 'admin'
}

let projectFilter = 'All'

function renderList() {
  const body = document.getElementById('procBody')
  const searchEl = document.getElementById('procSearch')
  const filterContainer = document.getElementById('procProjectFilters')
  if (!body) return

  const procurements = getProcurements()
  const query = (searchEl?.value || '').toLowerCase()
  let filtered = procurements.filter(
    (p) =>
      (p.project || '').toLowerCase().includes(query) ||
      (p.items || '').toLowerCase().includes(query)
  )
  if (projectFilter !== 'All') {
    filtered = filtered.filter((p) => p.project === projectFilter)
  }

  const uniqueProjects = [...new Set(procurements.map((p) => p.project).filter(Boolean))]

  if (filterContainer) {
    filterContainer.innerHTML = uniqueProjects
      .map(
        (proj) =>
          `<button class="btn-filter" data-proc-filter="${proj}">${proj}</button>`
      )
      .join('')

    filterContainer.querySelectorAll('[data-proc-filter]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.procFilter === projectFilter)
      btn.addEventListener('click', () => setFilter(btn.dataset.procFilter))
    })
  }

  document.querySelectorAll('#procFilterGroup .btn-filter[data-proc-filter="All"]').forEach((btn) => {
    btn.classList.toggle('active', projectFilter === 'All')
  })

  function escapeHtml(s) {
    const div = document.createElement('div')
    div.textContent = s
    return div.innerHTML
  }

  const adminClass = isAdmin() ? '' : 'admin-only'

  body.innerHTML = filtered
    .map((p) => {
      const idx = procurements.indexOf(p)
      const color = STATUS_COLORS[p.status] || STATUS_COLORS.Pending
      return `<tr>
        <td><b>${escapeHtml(p.project || '')}</b></td>
        <td>${escapeHtml(p.items || '')}</td>
        <td><span class="status-pill" style="background:${color}" data-cycle-idx="${idx}">${escapeHtml(p.status || 'Pending')}</span></td>
        <td class="${adminClass}"><button class="btn-del" data-del-idx="${idx}">X</button></td>
      </tr>`
    })
    .join('')

  body.querySelectorAll('.status-pill[data-cycle-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      if (!isAdmin()) return
      const idx = parseInt(el.dataset.cycleIdx, 10)
      const procurements = getProcurements()
      const p = procurements[idx]
      if (p) {
        const i = STATUS_STATES.indexOf(p.status)
        p.status = STATUS_STATES[(i + 1) % STATUS_STATES.length]
        saveProcurements(procurements)
        renderList()
      }
    })
  })

  body.querySelectorAll('.btn-del[data-del-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.delIdx, 10)
      if (confirm('Delete this record?')) {
        const procurements = getProcurements()
        procurements.splice(idx, 1)
        saveProcurements(procurements)
        renderList()
      }
    })
  })
}

function addProcurement() {
  const project = document.getElementById('pProject')?.value?.trim()
  const items = document.getElementById('pItems')?.value?.trim()
  const status = document.getElementById('pStatus')?.value || 'Pending'

  if (!project || !items) return

  const procurements = getProcurements()
  procurements.push({ project, items, status })
  saveProcurements(procurements)

  ;['pProject', 'pItems'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })

  renderList()
}

function setFilter(filter) {
  projectFilter = filter
  document.querySelectorAll('#procFilterGroup .btn-filter[data-proc-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.procFilter === filter)
  })
  renderList()
}

function toggleAdminElements() {
  const show = isAdmin()
  document.querySelectorAll('#content-area .admin-only').forEach((el) => {
    el.style.display = show ? (el.tagName === 'TH' || el.tagName === 'TD' ? 'table-cell' : 'block') : 'none'
  })
}

function bindEvents() {
  document.getElementById('procSearch')?.addEventListener('input', renderList)
  document.getElementById('procSearch')?.addEventListener('keyup', renderList)
  document.getElementById('procAddBtn')?.addEventListener('click', addProcurement)
  document.querySelectorAll('#procFilterGroup .btn-filter[data-proc-filter="All"]').forEach((btn) => {
    btn.addEventListener('click', () => setFilter('All'))
  })
}

export function init() {
  toggleAdminElements()
  renderList()
  bindEvents()
}
