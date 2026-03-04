/**
 * Inventory module - list and registry
 * Uses localStorage until API is available (Phase 6)
 */

import { getUser } from '../auth.js'

const STORAGE_KEY = 'rei_inv'

function getInventory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

function saveInventory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function isAdmin() {
  const user = getUser()
  return user?.role === 'admin'
}

function renderList() {
  const invBody = document.getElementById('invBody')
  const invSearch = document.getElementById('invSearch')
  if (!invBody) return

  const inventory = getInventory()
  const query = (invSearch?.value || '').toLowerCase()
  const filtered = inventory.filter(
    (i) =>
      (i.name || '').toLowerCase().includes(query) ||
      (i.stock || '').toLowerCase().includes(query)
  )

  const adminClass = isAdmin() ? '' : 'admin-only'
  function escapeHtml(s) {
    const div = document.createElement('div')
    div.textContent = s
    return div.innerHTML
  }

  invBody.innerHTML = filtered
    .map((item) => {
      const realIdx = inventory.indexOf(item)
      const descSafe = escapeHtml(item.desc || '')
      return `<tr>
        <td>${escapeHtml(item.stock || '')}</td>
        <td><b>${escapeHtml(item.name || '')}</b></td>
        <td style="color:var(--accent-blue); cursor:pointer; text-decoration:underline" data-desc="${descSafe}">View Desc</td>
        <td>${escapeHtml(item.loc || '')}</td>
        <td>${escapeHtml(String(item.bal ?? ''))}</td>
        <td>${escapeHtml(item.col || '')}</td>
        <td>${escapeHtml(item.cat || '')}</td>
        <td class="${adminClass}"><button class="btn-del" data-idx="${realIdx}">X</button></td>
      </tr>`
    })
    .join('')

  invBody.querySelectorAll('[data-desc]').forEach((el) => {
    el.addEventListener('click', () => {
      window.openModal?.('Item Description', el.dataset.desc || '')
    })
  })

  invBody.querySelectorAll('.btn-del[data-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx, 10)
      if (confirm('Delete this item?')) {
        const inventory = getInventory()
        inventory.splice(idx, 1)
        saveInventory(inventory)
        renderList()
      }
    })
  })
}

function addItem() {
  if (!isAdmin()) return

  const stock = document.getElementById('iStock')?.value?.trim()
  const name = document.getElementById('iName')?.value?.trim()
  const desc = document.getElementById('iDesc')?.value?.trim()
  const loc = document.getElementById('iLoc')?.value?.trim()
  const bal = document.getElementById('iBal')?.value ?? ''
  const col = document.getElementById('iCol')?.value?.trim()
  const cat = document.getElementById('iCat')?.value?.trim()

  if (!stock || !name) return

  const inventory = getInventory()
  inventory.push({ stock, name, desc, loc, bal, col, cat })
  saveInventory(inventory)

  ;['iStock', 'iName', 'iDesc', 'iLoc', 'iBal', 'iCol', 'iCat'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.value = ''
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
  document.getElementById('invSearch')?.addEventListener('input', renderList)
  document.getElementById('invSearch')?.addEventListener('keyup', renderList)
  document.getElementById('invRegisterBtn')?.addEventListener('click', addItem)
}

export function init() {
  toggleAdminElements()
  renderList()
  bindEvents()
}
