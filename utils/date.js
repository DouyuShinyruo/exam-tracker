// utils/date.js

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format date as YYYY年MM月
 */
function formatMonth(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

/**
 * Calculate days remaining until target date
 * Returns positive number for future dates, negative for past
 */
function getDaysRemaining(targetDate) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Calculate months remaining (approximate)
 */
function getMonthsRemaining(targetDate) {
  const now = new Date()
  const target = new Date(targetDate)
  const yearDiff = target.getFullYear() - now.getFullYear()
  const monthDiff = target.getMonth() - now.getMonth()
  return yearDiff * 12 + monthDiff
}

/**
 * Generate a unique ID
 */
function generateId() {
  return 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * Get current ISO timestamp
 */
function nowISO() {
  return new Date().toISOString()
}

module.exports = {
  formatDate,
  formatMonth,
  getDaysRemaining,
  getMonthsRemaining,
  generateId,
  nowISO
}
