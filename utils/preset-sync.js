// utils/preset-sync.js
// Sync preset exams from backend

const app = getApp()

function syncPresets() {
  return new Promise((resolve, reject) => {
    const baseUrl = app.globalData.baseUrl
    if (!baseUrl) {
      resolve({ updated: false, reason: 'No backend URL' })
      return
    }

    wx.request({
      url: `${baseUrl}/api/preset-exams/last-update`,
      success: (res) => {
        if (res.statusCode !== 200) {
          resolve({ updated: false, reason: 'Failed to check update' })
          return
        }

        const remoteUpdate = res.data.lastUpdate
        const localLastUpdate = wx.getStorageSync('presetsLastUpdate')

        if (remoteUpdate && remoteUpdate !== localLastUpdate) {
          fetchAndSavePresets(baseUrl, remoteUpdate)
            .then(result => resolve(result))
            .catch(err => reject(err))
        } else {
          resolve({ updated: false })
        }
      },
      fail: (err) => {
        console.error('Failed to check preset updates:', err)
        resolve({ updated: false, reason: 'Network error' })
      }
    })
  })
}

function fetchAndSavePresets(baseUrl, remoteUpdate) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}/api/preset-exams`,
      success: (res) => {
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          wx.setStorageSync('presetExams', res.data)
          wx.setStorageSync('presetsLastUpdate', remoteUpdate)
          resolve({ updated: true, count: res.data.length })
        } else {
          resolve({ updated: false, reason: 'Invalid response' })
        }
      },
      fail: (err) => {
        console.error('Failed to fetch presets:', err)
        reject(err)
      }
    })
  })
}

module.exports = {
  syncPresets
}
