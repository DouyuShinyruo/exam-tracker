// utils/api-storage.js
// Backend API storage implementation - swap with local-storage.js for cloud sync

const BASE_URL = 'https://your-server.com/api' // Change to your server URL

function getHeaders() {
  const userId = wx.getStorageSync('userId')
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId || ''
  }
}

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      header: getHeaders(),
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(`Request failed: ${res.statusCode}`))
        }
      },
      fail: reject
    })
  })
}

async function getExams() {
  return request('/exams')
}

async function getExamById(id) {
  return request(`/exams/${id}`)
}

async function addExam(exam) {
  return request('/exams', {
    method: 'POST',
    data: exam
  })
}

async function updateExam(id, data) {
  return request(`/exams/${id}`, {
    method: 'PUT',
    data
  })
}

async function deleteExam(id) {
  return request(`/exams/${id}`, {
    method: 'DELETE'
  })
}

async function searchExams(keyword) {
  return request(`/exams?keyword=${encodeURIComponent(keyword)}`)
}

async function getPresetExams() {
  return request('/preset-exams')
}

async function searchPresetExams(keyword) {
  return request(`/preset-exams?keyword=${encodeURIComponent(keyword)}`)
}

async function getPresetExamById(id) {
  return request(`/preset-exams/${id}`)
}

async function syncExams(exams, lastSyncAt) {
  return request('/sync', {
    method: 'POST',
    data: { exams, lastSyncAt }
  })
}

async function getLastSyncTime() {
  return request('/sync/last')
}

module.exports = {
  getExams,
  getExamById,
  addExam,
  updateExam,
  deleteExam,
  searchExams,
  getPresetExams,
  searchPresetExams,
  getPresetExamById,
  syncExams,
  getLastSyncTime
}
