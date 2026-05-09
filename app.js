const { syncPresets } = require('./utils/preset-sync')

App({
  onLaunch() {
    console.log('Exam Tracker launched')
    this.syncPresetsOnLaunch()
  },

  syncPresetsOnLaunch() {
    if (!this.globalData.baseUrl) return
    syncPresets().then(result => {
      if (result.updated) {
        console.log(`Synced ${result.count} preset exams from backend`)
      }
    }).catch(err => {
      console.error('Preset sync failed:', err)
    })
  },

  globalData: {
    version: '1.0.0',
    baseUrl: '', // Set to your backend URL, e.g. 'https://exam-tracker-server.up.railway.app'
    userId: ''   // Set after WeChat login
  }
})
