/**
 * Deliveries module - PO tracking with status and remarks
 * Uses localStorage until API is available (Phase 6)
 */

import { getUser } from '../auth.js'

const STORAGE_KEY = 'rei_deliv'
const STATUS_STATES = ['Pending', 'Complete', 'Unavailable']
const STATUS_COLORS = {
  Pending: '#fef9c3;color:#854d0e',
  Complete: '#dcfce7;color:#166534',
  Unavailable: '#fee2e2;color:#991b1b',
}

function getDeliveries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

function saveDeliveries(deliveries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries))
}

function isAdmin() {
  return getUser()?.role === 'admin'
}

let statusFilter = 'All'

function renderList() {
  const body = document.getElementById('delivBody')
  const searchEl = document.getElementById('delSearch')
  if (!body) return

  const deliveries = getDeliveries()
  const query = (searchEl?.value || '').toLowerCase()
  let filtered = deliveries.filter(
    (d) =>
      (d.po || '').toLowerCase().includes(query) ||
      (d.item || '').toLowerCase().includes(query)
  )
  if (statusFilter !== 'All') {
    filtered = filtered.filter((d) => d.status === statusFilter)
  }

  function escapeHtml(s) {
    const div = document.createElement('div')
    div.textContent = s
    return div.innerHTML
  }

  const adminClass = isAdmin() ? '' : 'admin-only'

  body.innerHTML = filtered
    .map((d) => {
      const idx = deliveries.indexOf(d)
      const color = STATUS_COLORS[d.status] || STATUS_COLORS.Pending
      const remarks = escapeHtml(d.remarks || '')
      const contentEditable = isAdmin() ? 'contenteditable="true"' : ''
      return `<tr>
        <td>${escapeHtml(d.po || '')}</td>
        <td><b>${escapeHtml(d.item || '')}</b></td>
        <td>${escapeHtml(String(d.qty ?? ''))}</td>
        <td>${escapeHtml(d.proc || '')}</td>
        <td>${escapeHtml(d.arr || '')}</td>
        <td>${escapeHtml(d.insp || '')}</td>
        <td>${escapeHtml(d.rel || '')}</td>
        <td><span class="status-pill" style="background:${color}" data-cycle-idx="${idx}">${escapeHtml(d.status || 'Pending')}</span></td>
        <td><div class="editable-cell" ${contentEditable} data-remarks-idx="${idx}">${remarks}</div></td>
        <td class="${adminClass}"><button class="btn-del" data-del-idx="${idx}">X</button></td>
      </tr>`
    })
    .join('')

  body.querySelectorAll('.status-pill[data-cycle-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      if (!isAdmin()) return
      const idx = parseInt(el.dataset.cycleIdx, 10)
      const deliveries = getDeliveries()
      const d = deliveries[idx]
      if (d) {
        const i = STATUS_STATES.indexOf(d.status)
        d.status = STATUS_STATES[(i + 1) % STATUS_STATES.length]
        saveDeliveries(deliveries)
        renderList()
      }
    })
  })

  body.querySelectorAll('.editable-cell[data-remarks-idx]').forEach((el) => {
    el.addEventListener('blur', () => {
      if (!isAdmin()) return
      const idx = parseInt(el.dataset.remarksIdx, 10)
      const deliveries = getDeliveries()
      if (deliveries[idx]) {
        deliveries[idx].remarks = el.textContent || ''
        saveDeliveries(deliveries)
      }
    })
  })

  body.querySelectorAll('.btn-del[data-del-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.delIdx, 10)
      if (confirm('Delete this delivery?')) {
        const deliveries = getDeliveries()
        deliveries.splice(idx, 1)
        saveDeliveries(deliveries)
        renderList()
      }
    })
  })
}

function addDelivery() {
  if (!isAdmin()) return

  const po = document.getElementById('dPO')?.value?.trim()
  const item = document.getElementById('dItem')?.value?.trim()
  const qty = document.getElementById('dQty')?.value ?? ''
  const proc = document.getElementById('dProc')?.value ?? ''
  const arr = document.getElementById('dArr')?.value ?? ''
  const insp = document.getElementById('dInsp')?.value ?? ''
  const rel = document.getElementById('dRel')?.value ?? ''
  const remarks = document.getElementById('dRem')?.value?.trim() ?? ''

  const deliveries = getDeliveries()
  deliveries.push({
    po,
    item,
    qty,
    proc,
    arr,
    insp,
    rel,
    status: 'Pending',
    remarks,
  })
  saveDeliveries(deliveries)

  ;['dPO', 'dItem', 'dQty', 'dProc', 'dArr', 'dInsp', 'dRel', 'dRem'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })

  renderList()
}

function setFilter(filter) {
  statusFilter = filter
  document.querySelectorAll('.filter-group .btn-filter[data-deliv-filter]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.delivFilter === filter)
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
  document.getElementById('delSearch')?.addEventListener('input', renderList)
  document.getElementById('delSearch')?.addEventListener('keyup', renderList)
  document.getElementById('delivAddBtn')?.addEventListener('click', addDelivery)
  document.querySelectorAll('.filter-group .btn-filter[data-deliv-filter]').forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.delivFilter))
  })
}

export function init() {
  toggleAdminElements()
  renderList()
  bindEvents()
}
