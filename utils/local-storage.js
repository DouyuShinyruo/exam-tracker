// utils/local-storage.js
const EXAMS_KEY = 'user_exams'

/**
 * Get all exams from local storage
 */
function getExams() {
  try {
    const data = wx.getStorageSync(EXAMS_KEY)
    return data || []
  } catch (e) {
    console.error('Failed to get exams:', e)
    return []
  }
}

/**
 * Save all exams to local storage
 */
function saveExams(exams) {
  try {
    wx.setStorageSync(EXAMS_KEY, exams)
  } catch (e) {
    console.error('Failed to save exams:', e)
  }
}

/**
 * Get single exam by ID
 */
function getExamById(id) {
  const exams = getExams()
  return exams.find(e => e.id === id) || null
}

/**
 * Add a new exam
 */
function addExam(exam) {
  const exams = getExams()
  exams.push(exam)
  saveExams(exams)
  return exam
}

/**
 * Update an existing exam
 */
function updateExam(id, data) {
  const exams = getExams()
  const index = exams.findIndex(e => e.id === id)
  if (index === -1) return null
  exams[index] = { ...exams[index], ...data, updatedAt: new Date().toISOString() }
  saveExams(exams)
  return exams[index]
}

/**
 * Delete an exam
 */
function deleteExam(id) {
  const exams = getExams()
  const filtered = exams.filter(e => e.id !== id)
  saveExams(filtered)
  return filtered.length < exams.length
}

/**
 * Search exams by keyword
 */
function searchExams(keyword) {
  if (!keyword) return getExams()
  const lower = keyword.toLowerCase()
  const exams = getExams()
  return exams.filter(e =>
    e.name.toLowerCase().includes(lower) ||
    (e.region && e.region.toLowerCase().includes(lower))
  )
}

module.exports = {
  getExams,
  getExamById,
  addExam,
  updateExam,
  deleteExam,
  searchExams
}
