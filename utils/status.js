// utils/status.js
const { getDaysRemaining } = require('./date')

/**
 * Status priority (highest first):
 * 1. examSoon (red)    - exam within 7 days
 * 2. deadlineSoon (yellow) - registration deadline within 7 days
 * 3. registering (green) - registration open
 * 4. closed (gray)     - registration closed, exam > 7 days away
 */

const STATUS = {
  EXAM_SOON: {
    key: 'examSoon',
    label: '考试临近',
    color: '#FF4D4F',
    priority: 1
  },
  DEADLINE_SOON: {
    key: 'deadlineSoon',
    label: '即将截止',
    color: '#FAAD14',
    priority: 2
  },
  REGISTERING: {
    key: 'registering',
    label: '报名中',
    color: '#52C41A',
    priority: 3
  },
  CLOSED: {
    key: 'closed',
    label: '已截止',
    color: '#999999',
    priority: 4
  }
}

/**
 * Calculate exam status based on dates
 * @param {string} examDate - exam date (YYYY-MM-DD)
 * @param {string|null} registrationDeadline - registration deadline (YYYY-MM-DD)
 * @returns {object} status object with key, label, color
 */
function getExamStatus(examDate, registrationDeadline) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const exam = new Date(examDate)
  exam.setHours(0, 0, 0, 0)

  const daysToExam = getDaysRemaining(examDate)

  // Priority 1: exam soon (within 7 days)
  if (daysToExam >= 0 && daysToExam <= 7) {
    return STATUS.EXAM_SOON
  }

  // If no deadline, default to registering if exam is in future
  if (!registrationDeadline) {
    return daysToExam > 0 ? STATUS.REGISTERING : STATUS.CLOSED
  }

  const deadline = new Date(registrationDeadline)
  deadline.setHours(0, 0, 0, 0)
  const daysToDeadline = getDaysRemaining(registrationDeadline)

  // Priority 2: deadline soon (within 7 days and not passed)
  if (daysToDeadline >= 0 && daysToDeadline <= 7) {
    return STATUS.DEADLINE_SOON
  }

  // Priority 3: registering (deadline not passed)
  if (now < deadline) {
    return STATUS.REGISTERING
  }

  // Priority 4: closed
  return STATUS.CLOSED
}

/**
 * Get countdown text for display
 */
function getCountdownText(exam) {
  if (exam.examDateType === 'approximate') {
    const months = getDaysRemaining(exam.examDate)
    const monthDiff = (() => {
      const now = new Date()
      const target = new Date(exam.examDate)
      return (target.getFullYear() - now.getFullYear()) * 12 + target.getMonth() - now.getMonth()
    })()
    if (monthDiff <= 0) return '本月考试'
    return `预计还有约 ${monthDiff} 个月`
  }

  const days = getDaysRemaining(exam.examDate)
  if (days < 0) return '考试已结束'
  if (days === 0) return '今天考试'
  return `距离考试还有 ${days} 天`
}

module.exports = {
  STATUS,
  getExamStatus,
  getCountdownText
}
