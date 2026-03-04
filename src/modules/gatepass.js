/**
 * Gate Pass module - request equipment, cart, history
 * Uses localStorage until API is available (Phase 6)
 */

import { getUser } from '../auth.js'

const STORAGE_KEY = 'rei_gp'
const INV_KEY = 'rei_inv'

function getGatepasses() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

function getInventory() {
  return JSON.parse(localStorage.getItem(INV_KEY) || '[]')
}

function saveGatepasses(gatepasses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gatepasses))
}

let gpCart = []

function escapeHtml(s) {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function renderPicker() {
  const body = document.getElementById('gpPickerBody')
  const searchEl = document.getElementById('gpPickerSearch')
  if (!body) return

  const inventory = getInventory()
  const query = (searchEl?.value || '').toLowerCase()
  const filtered = inventory.filter(
    (i) =>
      (i.name || '').toLowerCase().includes(query) ||
      (i.stock || '').toLowerCase().includes(query)
  )

  body.innerHTML = filtered
    .map((item) => {
      const inCart = gpCart.find((c) => c.name === item.name)
      const qty = inCart ? inCart.qty : 1
      const safeName = escapeHtml(item.name).replace(/"/g, '&quot;')
      return `<tr>
        <td style="width: 40px; text-align: center;"><input type="checkbox" data-item-name="${safeName}" ${inCart ? 'checked' : ''}></td>
        <td><div style="display:flex; align-items:center; gap:8px"><span>${escapeHtml(item.name)} <span style="font-size: 10px; color: #64748b;">[${escapeHtml(item.stock || '')}]</span></span><input type="number" class="qty-mini" data-item-name="${safeName}" value="${qty}" min="1"></div></td>
      </tr>`
    })
    .join('')

  body.querySelectorAll('input[type="checkbox"][data-item-name]').forEach((el) => {
    el.addEventListener('change', () => {
      const name = el.dataset.itemName?.replace(/&quot;/g, '"') || ''
      const qtyEl = el.closest('tr')?.querySelector('input.qty-mini')
      const qty = parseInt(qtyEl?.value || 1, 10)
      const idx = gpCart.findIndex((c) => c.name === name)
      if (el.checked) {
        if (idx === -1) gpCart.push({ name, qty })
      } else {
        if (idx >= 0) gpCart.splice(idx, 1)
      }
      renderUI()
    })
  })

  body.querySelectorAll('tr').forEach((row) => {
    const qtyEl = row.querySelector('input.qty-mini')
    const nameEl = row.querySelector('input[type="checkbox"][data-item-name]')
    if (!qtyEl || !nameEl) return
    qtyEl.addEventListener('change', () => {
      const name = nameEl.dataset.itemName?.replace(/&quot;/g, '"') || ''
      const qty = parseInt(qtyEl.value || 1, 10)
      const item = gpCart.find((c) => c.name === name)
      if (item) {
        item.qty = qty
        renderUI()
      }
    })
  })
}

function renderCart() {
  const list = document.getElementById('gpCartList')
  if (!list) return

  if (gpCart.length === 0) {
    list.innerHTML = '<li style="color: #94a3b8;">No items added...</li>'
    return
  }

  list.innerHTML = gpCart
    .map(
      (item, idx) =>
        `<li class="cart-item"><span><b>${escapeHtml(String(item.qty))}x</b> ${escapeHtml(item.name)}</span><span style="color: var(--danger-red); cursor: pointer;" data-remove-idx="${idx}">✕</span></li>`
    )
    .join('')

  list.querySelectorAll('[data-remove-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      gpCart.splice(parseInt(el.dataset.removeIdx, 10), 1)
      renderUI()
    })
  })
}

function renderHistory() {
  const body = document.getElementById('gpHistoryBody')
  if (!body) return

  const gatepasses = getGatepasses()

  body.innerHTML = gatepasses
    .map((gp, idx) => {
      const statusColor = gp.status === 'Done' ? '#dcfce7;color:#166534' : '#fee2e2;color:#991b1b'
      return `<tr>
        <td><b>${escapeHtml(gp.requester || '')}</b></td>
        <td>${escapeHtml(gp.loc || '')}</td>
        <td><span style="color:var(--accent-blue); cursor:pointer; text-decoration:underline" data-view-idx="${idx}">View Items</span></td>
        <td>${escapeHtml(gp.date || '')}</td>
        <td>${escapeHtml(gp.return || '')}</td>
        <td><span class="status-pill" style="background:${statusColor}" data-toggle-idx="${idx}">${escapeHtml(gp.status || 'Undone')}</span></td>
        <td><button class="btn-del" data-del-idx="${idx}">X</button></td>
      </tr>`
    })
    .join('')

  body.querySelectorAll('[data-view-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const gp = gatepasses[parseInt(el.dataset.viewIdx, 10)]
      if (gp) showGPDetails(gp)
    })
  })

  body.querySelectorAll('[data-toggle-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.toggleIdx, 10)
      const gatepasses = getGatepasses()
      const gp = gatepasses[idx]
      if (gp) {
        gp.status = gp.status === 'Done' ? 'Undone' : 'Done'
        saveGatepasses(gatepasses)
        renderHistory()
      }
    })
  })

  body.querySelectorAll('[data-del-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.delIdx, 10)
      if (confirm('Delete record?')) {
        const gatepasses = getGatepasses()
        gatepasses.splice(idx, 1)
        saveGatepasses(gatepasses)
        renderHistory()
      }
    })
  })
}

function renderUI() {
  renderPicker()
  renderCart()
  renderHistory()
}

function showGPDetails(gp) {
  const items = gp.items || []
  const listHtml = `
    <div style="margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
      <p><b>Requester:</b> ${escapeHtml(gp.requester || '')}</p>
      <p><b>Location:</b> ${escapeHtml(gp.loc || '')}</p>
      <p><b>Date:</b> ${gp.date || ''} to ${gp.return || ''}</p>
    </div>
    <p><b>Equipment List:</b></p>
    <ul style="padding-left:20px; text-align:left;">${items.map((i) => `<li><b>${escapeHtml(String(i.qty))}x</b> ${escapeHtml(i.name || '')}</li>`).join('')}</ul>
  `
  window.openModal?.('Gate Pass Details', listHtml)
}

function addCustomItem() {
  const item = document.getElementById('customItem')?.value?.trim()
  const qty = parseInt(document.getElementById('customQty')?.value || 1, 10)
  if (!item) return
  gpCart.push({ name: item + ' (Custom)', qty })
  document.getElementById('customItem').value = ''
  document.getElementById('customQty').value = '1'
  renderUI()
}

function submitGatePass() {
  const name = document.getElementById('gpReq')?.value?.trim()
  const loc = document.getElementById('gpLoc')?.value?.trim()
  const date = document.getElementById('gpDate')?.value ?? ''
  const returnDate = document.getElementById('gpReturn')?.value ?? ''

  if (!name || gpCart.length === 0) {
    alert('Requester Name and items required.')
    return
  }

  const gatepasses = getGatepasses()
  gatepasses.push({
    requester: name,
    loc,
    date,
    return: returnDate,
    items: JSON.parse(JSON.stringify(gpCart)),
    status: 'Undone',
  })
  saveGatepasses(gatepasses)

  gpCart = []
  ;['gpReq', 'gpLoc', 'gpDate', 'gpReturn'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })

  renderUI()
}

function bindEvents() {
  document.getElementById('gpPickerSearch')?.addEventListener('input', renderUI)
  document.getElementById('gpPickerSearch')?.addEventListener('keyup', renderUI)
  document.getElementById('gpCustomAddBtn')?.addEventListener('click', addCustomItem)
  document.getElementById('gpSubmitBtn')?.addEventListener('click', submitGatePass)
}

export function init() {
  gpCart = []
  renderUI()
  bindEvents()
}
