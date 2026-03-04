/**
 * Deployment module - deployed equipment tracking
 * Uses localStorage until API is available (Phase 6)
 */

import { getUser } from '../auth.js'

const STORAGE_KEY = 'rei_dep'

function getDeployments() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

function saveDeployments(deployments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deployments))
}

function isAdmin() {
  return getUser()?.role === 'admin'
}

let locationFilter = 'All'

function escapeHtml(s) {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function renderLocationGrid() {
  const grid = document.getElementById('dep-location-grid')
  if (!grid) return

  const deployments = getDeployments()
  const uniqueLocs = [...new Set(deployments.map((d) => d.loc).filter(Boolean))]

  grid.innerHTML =
    `<div class="card clickable ${locationFilter === 'All' ? 'active-card' : ''}" data-dep-filter="all"><h3>View All</h3><p>Locations</p></div>` +
    uniqueLocs
      .map(
        (loc, i) =>
          `<div class="card clickable ${locationFilter === loc ? 'active-card' : ''}" data-dep-loc-idx="${i}"><h3>${escapeHtml(loc)}</h3><p>${deployments.filter((d) => d.loc === loc).length}</p></div>`
      )
      .join('')

  grid.querySelectorAll('[data-dep-filter="all"]').forEach((el) => {
    el.addEventListener('click', () => setLocationFilter('All'))
  })
  grid.querySelectorAll('[data-dep-loc-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.depLocIdx, 10)
      setLocationFilter(uniqueLocs[idx] || 'All')
    })
  })
}

function renderList() {
  const body = document.getElementById('deployedBody')
  const searchEl = document.getElementById('depSearch')
  if (!body) return

  const deployments = getDeployments()
  const query = (searchEl?.value || '').toLowerCase()
  let filtered = deployments.filter(
    (d) =>
      locationFilter === 'All' ||
      d.loc === locationFilter
  )
  filtered = filtered.filter(
    (d) =>
      (d.desc || '').toLowerCase().includes(query) ||
      (d.prop || '').toLowerCase().includes(query)
  )

  body.innerHTML = filtered
    .map((d) => {
      const idx = deployments.indexOf(d)
      return `<tr>
        <td>${escapeHtml(d.loc || '')}</td>
        <td>${escapeHtml(String(d.qty ?? ''))}</td>
        <td>${escapeHtml(d.unit || '')}</td>
        <td>${escapeHtml(d.desc || '')}</td>
        <td>${escapeHtml(d.prop || '')}</td>
        <td>${escapeHtml(String(d.uVal ?? ''))}</td>
        <td>${escapeHtml(String(d.tVal ?? ''))}</td>
        <td><button class="btn-del" data-del-idx="${idx}">X</button></td>
      </tr>`
    })
    .join('')

  body.querySelectorAll('[data-del-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.delIdx, 10)
      if (confirm('Delete this deployment?')) {
        const deployments = getDeployments()
        deployments.splice(idx, 1)
        saveDeployments(deployments)
        renderLocationGrid()
        renderList()
      }
    })
  })
}

function addDeployment() {
  if (!isAdmin()) return

  const loc = document.getElementById('depLoc')?.value?.trim()
  const qty = parseFloat(document.getElementById('depQty')?.value) || 0
  const unit = document.getElementById('depUnit')?.value?.trim() ?? ''
  const desc = document.getElementById('depDesc')?.value?.trim()
  const prop = document.getElementById('depProp')?.value?.trim() ?? ''
  const uVal = parseFloat(document.getElementById('depVal')?.value) || 0

  if (!loc || !desc) return

  const deployments = getDeployments()
  deployments.push({
    loc,
    qty,
    unit,
    desc,
    prop,
    uVal,
    tVal: qty * uVal,
  })
  saveDeployments(deployments)

  ;['depLoc', 'depQty', 'depUnit', 'depDesc', 'depProp', 'depVal'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.value = ''
  })

  renderLocationGrid()
  renderList()
}

function setLocationFilter(filter) {
  locationFilter = filter
  renderLocationGrid()
  renderList()
}

function toggleAdminElements() {
  const show = isAdmin()
  document.querySelectorAll('#content-area .admin-only').forEach((el) => {
    el.style.display = show ? (el.tagName === 'TH' || el.tagName === 'TD' ? 'table-cell' : 'block') : 'none'
  })
}

function bindEvents() {
  document.getElementById('depSearch')?.addEventListener('input', renderList)
  document.getElementById('depSearch')?.addEventListener('keyup', renderList)
  document.getElementById('depAddBtn')?.addEventListener('click', addDeployment)
}

export function init() {
  toggleAdminElements()
  renderLocationGrid()
  renderList()
  bindEvents()
}
