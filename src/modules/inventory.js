/**
 * Inventory module - list and registry
 * Uses MongoDB API when available, falls back to localStorage
 */

import { getUser } from '../auth.js'
import { api } from '../api.js'

const STORAGE_KEY = 'rei_inv'
const PAGE_SIZE = 10
let currentPage = 1
let totalPages = 1

async function loadInventory() {
  try {
    const items = await api.get('/api/inventory')
    const arr = Array.isArray(items) ? items : []
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
    return arr
  } catch {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  }
}

function getLocalInventory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

function saveLocalInventory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function isAdmin() {
  const user = getUser()
  return user?.role === 'admin'
}

async function renderList() {
  const invBody = document.getElementById('invBody')
  const invSearch = document.getElementById('invSearch')
  if (!invBody) return

  const inventory = await loadInventory()
  const query = (invSearch?.value || '').toLowerCase()
  const filtered = inventory.filter(
    (i) =>
      (i.name || '').toLowerCase().includes(query) ||
      (i.stock || '').toLowerCase().includes(query)
  )

  totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  if (currentPage > totalPages) currentPage = totalPages
  const start = (currentPage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(start, start + PAGE_SIZE)

  const adminClass = isAdmin() ? '' : 'admin-only'
  function escapeHtml(s) {
    const div = document.createElement('div')
    div.textContent = s
    return div.innerHTML
  }

  const pencilIcon = '<svg class="btn-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>'
  const trashIcon = '<svg class="btn-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>'

  invBody.innerHTML = pageItems
    .map((item) => {
      const id = item._id || inventory.indexOf(item)
      const descContent = escapeHtml(item.desc || '(No description)')
      return `<tr>
        <td>${escapeHtml(item.stock || '')}</td>
        <td><b>${escapeHtml(item.name || '')}</b></td>
        <td class="inv-desc-cell" contenteditable="false" data-id="${String(id)}">${descContent}</td>
        <td>${escapeHtml(item.loc || '')}</td>
        <td>${escapeHtml(String(item.bal ?? ''))}</td>
        <td>${escapeHtml(item.col || '')}</td>
        <td>${escapeHtml(item.cat || '')}</td>
        <td class="${adminClass} inv-actions">
          <button type="button" class="btn-icon btn-edit" data-id="${String(id)}" title="Edit description">${pencilIcon}</button>
          <button type="button" class="btn-icon btn-del" data-id="${String(id)}" title="Delete">${trashIcon}</button>
        </td>
      </tr>`
    })
    .join('')

  function onDescBlur(el) {
    if (el.getAttribute('contenteditable') !== 'true') return
    el.setAttribute('contenteditable', 'false')
    el.classList.remove('editable-cell')
    const id = el.dataset.id
    const newDesc = el.textContent?.trim() ?? ''
    const item = inventory.find(
      (i) => String(i._id || '') === id || String(inventory.indexOf(i)) === id
    )
    if (!item || (item.desc || '') === newDesc) return
    if (item._id) {
      api.put(`/api/inventory/${String(item._id)}`, { desc: newDesc })
        .then(() => {
          item.desc = newDesc
          localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))
        })
        .catch(() => {
          el.textContent = item.desc || '(No description)'
        })
    } else {
      item.desc = newDesc
      saveLocalInventory(inventory)
    }
  }

  if (isAdmin()) {
    invBody.querySelectorAll('.inv-desc-cell').forEach((el) => {
      el.addEventListener('blur', () => onDescBlur(el))
    })
  }

  invBody.querySelectorAll('.btn-icon.btn-edit').forEach((el) => {
    el.addEventListener('click', () => {
      const row = el.closest('tr')
      const descCell = row?.querySelector('.inv-desc-cell')
      if (descCell && isAdmin()) {
        descCell.setAttribute('contenteditable', 'true')
        descCell.classList.add('editable-cell')
        descCell.focus()
      }
    })
  })

  invBody.querySelectorAll('.btn-icon.btn-del').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = el.dataset.id
      if (!confirm('Delete this item?')) return
      try {
        await api.delete(`/api/inventory?id=${id}`)
        renderList()
      } catch {
        const inv = getLocalInventory()
        const idx = parseInt(id, 10)
        if (!isNaN(idx) && idx >= 0) {
          inv.splice(idx, 1)
          saveLocalInventory(inv)
          renderList()
        }
      }
    })
  })

  const paginationEl = document.getElementById('invPagination')
  const prevBtn = document.getElementById('invPrev')
  const nextBtn = document.getElementById('invNext')
  const pageInfoEl = document.getElementById('invPageInfo')
  if (paginationEl) {
    paginationEl.style.display = filtered.length > PAGE_SIZE ? 'flex' : 'none'
    if (pageInfoEl) pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`
    if (prevBtn) prevBtn.disabled = currentPage <= 1
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages
  }
}

async function addItem() {
  if (!isAdmin()) return

  const stock = document.getElementById('iStock')?.value?.trim()
  const name = document.getElementById('iName')?.value?.trim()
  const desc = document.getElementById('iDesc')?.value?.trim()
  const loc = document.getElementById('iLoc')?.value?.trim()
  const bal = document.getElementById('iBal')?.value ?? ''
  const col = document.getElementById('iCol')?.value?.trim()
  const cat = document.getElementById('iCat')?.value?.trim()

  if (!stock || !name) return

  try {
    await api.post('/api/inventory', { stock, name, desc, loc, bal, col, cat })
    ;['iStock', 'iName', 'iDesc', 'iLoc', 'iBal', 'iCol', 'iCat'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) el.value = ''
    })
    renderList()
  } catch {
    const inventory = getLocalInventory()
    inventory.push({ stock, name, desc, loc, bal, col, cat })
    saveLocalInventory(inventory)
    ;['iStock', 'iName', 'iDesc', 'iLoc', 'iBal', 'iCol', 'iCat'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) el.value = ''
    })
    renderList()
  }
}

function toggleAdminElements() {
  const show = isAdmin()
  document.querySelectorAll('#content-area .admin-only').forEach((el) => {
    el.style.display = show ? (el.tagName === 'TH' || el.tagName === 'TD' ? 'table-cell' : 'block') : 'none'
  })
}

function bindEvents() {
  document.getElementById('invSearch')?.addEventListener('input', () => {
    currentPage = 1
    renderList()
  })
  document.getElementById('invSearch')?.addEventListener('keyup', () => {
    currentPage = 1
    renderList()
  })
  document.getElementById('invRegisterBtn')?.addEventListener('click', addItem)
  document.getElementById('invPrev')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--
      renderList()
    }
  })
  document.getElementById('invNext')?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++
      renderList()
    }
  })
}

export function init() {
  toggleAdminElements()
  renderList()
  bindEvents()
}
