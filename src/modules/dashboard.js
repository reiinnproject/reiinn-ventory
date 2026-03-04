/**
 * Dashboard module - stats and calendar
 * Uses localStorage; tries API for inventory count when available
 */

import { api } from '../api.js'

let currentCalDate = new Date()
let currentCalFilter = 'All'

function getData() {
  return {
    inventory: JSON.parse(localStorage.getItem('rei_inv') || '[]'),
    deliveries: JSON.parse(localStorage.getItem('rei_deliv') || '[]'),
    gatepasses: JSON.parse(localStorage.getItem('rei_gp') || '[]'),
    schedules: JSON.parse(localStorage.getItem('rei_sched') || '[]'),
  }
}

async function renderStats() {
  let inventory = getData().inventory
  try {
    const items = await api.get('/api/inventory')
    if (Array.isArray(items)) {
      inventory = items
      localStorage.setItem('rei_inv', JSON.stringify(items))
    }
  } catch {
    // Use localStorage fallback
  }

  const { deliveries, gatepasses } = getData()
  const dashTotal = document.getElementById('dash-total')
  const dashDeliv = document.getElementById('dash-deliv')
  const dashGp = document.getElementById('dash-gp')
  if (dashTotal) dashTotal.textContent = inventory.length
  if (dashDeliv) dashDeliv.textContent = deliveries.filter((d) => d.status === 'Pending').length
  if (dashGp) dashGp.textContent = gatepasses.filter((gp) => gp.status === 'Undone').length
}

function initYearSelect() {
  const select = document.getElementById('calYearSelect')
  if (!select) return
  select.innerHTML = ''
  const startYear = 2024
  const endYear = 2030
  for (let y = startYear; y <= endYear; y++) {
    const opt = document.createElement('option')
    opt.value = y
    opt.textContent = y
    if (y === currentCalDate.getFullYear()) opt.selected = true
    select.appendChild(opt)
  }
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid')
  const calMonth = document.getElementById('calMonth')
  if (!grid) return

  const { gatepasses, schedules } = getData()
  const month = currentCalDate.getMonth()
  const year = currentCalDate.getFullYear()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  if (calMonth) calMonth.textContent = currentCalDate.toLocaleString('default', { month: 'long' })
  grid.innerHTML = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    .map((d) => `<div class="calendar-day-head">${d}</div>`)
    .join('')

  for (let i = 0; i < firstDay; i++) grid.innerHTML += '<div></div>'

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    let outEvents = []
    let returnEvents = []
    let dayScheds = []

    if (currentCalFilter === 'All' || currentCalFilter === 'GatePass') {
      outEvents = gatepasses.filter((g) => g.status === 'Done' && g.date === dateStr)
      returnEvents = gatepasses.filter((g) => g.status === 'Done' && g.return === dateStr)
    }
    if (currentCalFilter === 'All' || currentCalFilter === 'Schedule') {
      dayScheds = schedules.filter((s) => s.date === dateStr)
    }

    let labelsHtml = ''
    dayScheds.forEach((s, idx) => {
      labelsHtml += `<div class="cal-label label-sched" data-sched-idx="${schedules.indexOf(s)}">${s.title}</div>`
    })
    outEvents.forEach((e, idx) => {
      labelsHtml += `<div class="cal-label label-out" data-gp-idx="${gatepasses.indexOf(e)}">Out: ${e.requester}</div>`
    })
    returnEvents.forEach((e) => {
      labelsHtml += `<div class="cal-label label-return" data-gp-idx="${gatepasses.indexOf(e)}">Return: ${e.requester}</div>`
    })

    const hasEvents = outEvents.length || returnEvents.length || dayScheds.length
    grid.innerHTML += `
      <div class="calendar-day ${hasEvents ? 'bg-event' : ''}">
        <b>${d}</b>
        <div style="flex-grow:1; display:flex; flex-direction:column; gap:1px; margin-top:2px;">${labelsHtml}</div>
      </div>`
  }

  // Re-bind calendar label clicks
  grid.querySelectorAll('.cal-label[data-sched-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.schedIdx, 10)
      const s = schedules[idx]
      if (s) showSchedDetails(s)
    })
  })
  grid.querySelectorAll('.cal-label[data-gp-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.gpIdx, 10)
      const gp = gatepasses[idx]
      if (gp) showGPDetails(gp)
    })
  })
}

function showSchedDetails(s) {
  const content = `
    <p><b>Title:</b> ${s.title}</p>
    <p><b>Date:</b> ${s.date}</p>
    <p><b>Notes:</b> ${s.notes || 'No extra notes'}</p>
  `
  window.openModal?.('Schedule Details', content)
}

function showGPDetails(gp) {
  const items = gp.items || []
  const listHtml = `
    <div style="margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
      <p><b>Requester:</b> ${gp.requester}</p>
      <p><b>Location:</b> ${gp.loc}</p>
      <p><b>Date:</b> ${gp.date} to ${gp.return}</p>
    </div>
    <p><b>Equipment List:</b></p>
    <ul style="padding-left:20px; text-align:left;">${items.map((i) => `<li><b>${i.qty}x</b> ${i.name}</li>`).join('')}</ul>
  `
  window.openModal?.('Gate Pass Details', listHtml)
}

function setCalFilter(type) {
  currentCalFilter = type
  document.querySelectorAll('.calendar-header .btn-filter').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.calFilter === type)
  })
  renderCalendar()
}

function changeMonth(dir) {
  currentCalDate.setMonth(currentCalDate.getMonth() + dir)
  const yearSelect = document.getElementById('calYearSelect')
  if (yearSelect) yearSelect.value = currentCalDate.getFullYear()
  renderCalendar()
}

function jumpDate() {
  const yearSelect = document.getElementById('calYearSelect')
  if (yearSelect) currentCalDate.setFullYear(parseInt(yearSelect.value, 10))
  renderCalendar()
}

function bindEvents() {
  document.getElementById('cal-prev')?.addEventListener('click', () => changeMonth(-1))
  document.getElementById('cal-next')?.addEventListener('click', () => changeMonth(1))
  document.getElementById('calYearSelect')?.addEventListener('change', jumpDate)

  document.querySelectorAll('.calendar-header .btn-filter[data-cal-filter]').forEach((btn) => {
    btn.addEventListener('click', () => setCalFilter(btn.dataset.calFilter))
  })
}

export function init() {
  renderStats().then(() => {
    initYearSelect()
    renderCalendar()
    bindEvents()
  })
}
