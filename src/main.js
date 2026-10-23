import './style.css'

// ═══════════════════════════════════════════════
// MARIN'S TO-DO LIST ★ — Vanilla JS Scheduler
// ═══════════════════════════════════════════════

// ─── State ───────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('marin-tasks') || '[]')
let currentFilter = 'all'

// ─── DOM refs ────────────────────────────────
const taskInput    = document.getElementById('task-input')
const taskDate     = document.getElementById('task-date')
const taskTime     = document.getElementById('task-time')
const taskPriority = document.getElementById('task-priority')
const addBtn       = document.getElementById('add-btn')
const taskList     = document.getElementById('task-list')
const emptyState   = document.getElementById('empty-state')
const filterTabs   = document.getElementById('filter-tabs')

// ─── Helpers ─────────────────────────────────

/** Generate a simple unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/** Save tasks to localStorage */
function save() {
  localStorage.setItem('marin-tasks', JSON.stringify(tasks))
}

/** Format a date string nicely */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
}

/** Format time to 12-hour */
function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

/** Get the priority emoji/label */
function priorityBadge(priority) {
  switch (priority) {
    case 'urgent':    return '<span class="text-rose-500 font-bold text-xs">⚡ urgent</span>'
    case 'important': return '<span class="text-fuchsia-500 font-bold text-xs">★ important</span>'
    default:          return ''
  }
}

// ─── Render ──────────────────────────────────

function getFilteredTasks() {
  switch (currentFilter) {
    case 'active': return tasks.filter(t => !t.done)
    case 'done':   return tasks.filter(t => t.done)
    default:       return [...tasks]
  }
}

function render(animate = false) {
  const filtered = getFilteredTasks()

  // Toggle empty state
  if (filtered.length === 0) {
    emptyState.classList.remove('hidden')
    taskList.classList.add('hidden')
  } else {
    emptyState.classList.add('hidden')
    taskList.classList.remove('hidden')
  }

  taskList.innerHTML = filtered.map((task, i) => {
    const dateTime = [
      task.date ? formatDate(task.date) : '',
      task.time ? formatTime(task.time) : '',
    ].filter(Boolean).join(' · ')

    const priorityClass = task.priority !== 'normal' ? `priority-${task.priority}` : ''
    const doneClass = task.done ? 'done' : ''
    const enterClass = animate && i === 0 ? 'task-card-enter' : ''

    return `
      <div class="task-card ${priorityClass} ${doneClass} ${enterClass}" data-id="${task.id}">
        <input
          type="checkbox"
          class="task-check"
          ${task.done ? 'checked' : ''}
          aria-label="Mark task as ${task.done ? 'not done' : 'done'}"
        />
        <div class="flex-1 min-w-0">
          <p class="task-text font-sub font-semibold text-sm leading-snug text-zinc-800">${escapeHtml(task.text)}</p>
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            ${dateTime ? `<span class="font-body text-xs text-zinc-400">${dateTime}</span>` : ''}
            ${priorityBadge(task.priority)}
          </div>
        </div>
        <button class="task-delete" aria-label="Delete task" title="Delete">✕</button>
      </div>
    `
  }).join('')

  // Update filter tab active count badges
  updateFilterCounts()
}

function updateFilterCounts() {
  const tabs = filterTabs.querySelectorAll('.filter-tab')
  tabs.forEach(tab => {
    const filter = tab.dataset.filter
    if (filter === 'all') return
    // Could add count badges here in the future
  })
}

/** Escape HTML to prevent XSS */
function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// ─── Actions ─────────────────────────────────

function addTask() {
  const text = taskInput.value.trim()
  if (!text) {
    // Shake the input as visual feedback
    taskInput.classList.add('animate-shake')
    taskInput.style.borderColor = '#f43f5e'
    setTimeout(() => {
      taskInput.classList.remove('animate-shake')
      taskInput.style.borderColor = ''
    }, 500)
    return
  }

  const task = {
    id:       uid(),
    text,
    date:     taskDate.value || null,
    time:     taskTime.value || null,
    priority: taskPriority.value,
    done:     false,
    created:  Date.now(),
  }

  // Add to front so newest appears first
  tasks.unshift(task)
  save()

  // Clear inputs
  taskInput.value = ''
  taskDate.value = ''
  taskTime.value = ''
  taskPriority.value = 'normal'

  // Re-render with animation for the new task
  if (currentFilter === 'done') {
    currentFilter = 'all'
    setActiveFilterTab('all')
  }
  render(true)

  // Refocus input for rapid entry
  taskInput.focus()
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id)
  if (task) {
    task.done = !task.done
    save()
    render()
  }
}

function deleteTask(id) {
  const card = taskList.querySelector(`[data-id="${id}"]`)
  if (card) {
    card.classList.add('task-card-exit')
    card.addEventListener('animationend', () => {
      tasks = tasks.filter(t => t.id !== id)
      save()
      render()
    }, { once: true })
  }
}

function setActiveFilterTab(filter) {
  filterTabs.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter)
  })
}

// ─── Event Listeners ─────────────────────────

// Add task
addBtn.addEventListener('click', addTask)

// Enter key to add
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask()
})

// Task list delegation (checkbox toggle + delete)
taskList.addEventListener('click', (e) => {
  const card = e.target.closest('.task-card')
  if (!card) return
  const id = card.dataset.id

  if (e.target.classList.contains('task-check')) {
    toggleTask(id)
  } else if (e.target.classList.contains('task-delete')) {
    deleteTask(id)
  }
})

// Filter tabs
filterTabs.addEventListener('click', (e) => {
  const tab = e.target.closest('.filter-tab')
  if (!tab) return
  currentFilter = tab.dataset.filter
  setActiveFilterTab(currentFilter)
  render()
})

// ─── Keyboard shortcut: Ctrl+N focuses input ─
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault()
    taskInput.focus()
    taskInput.select()
  }
})

// ─── Init ────────────────────────────────────
// Set default date to today
const today = new Date()
taskDate.value = today.toISOString().split('T')[0]

// Initial render
render()

// Focus input on load
taskInput.focus()
