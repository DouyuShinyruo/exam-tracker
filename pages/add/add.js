// pages/add/add.js
const { searchPresetExams, groupByCategory, presetExams } = require('../../data/preset-exams')

Page({
  data: {
    keyword: '',
    searchResults: [],
    groupedExams: {},
    isSearching: false,
    showResults: false
  },

  onLoad() {
    // Show all grouped by default
    const groupedExams = groupByCategory(presetExams)
    this.setData({ groupedExams })
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ keyword })

    if (!keyword) {
      this.setData({
        searchResults: [],
        showResults: false,
        groupedExams: groupByCategory(presetExams)
      })
      return
    }

    const results = searchPresetExams(keyword)
    this.setData({
      searchResults: results,
      showResults: true,
      groupedExams: results.length > 0 ? {} : {}
    })
  },

  onSelectPreset(e) {
    const preset = e.currentTarget.dataset.preset
    wx.navigateTo({
      url: `/pages/edit/edit?presetId=${preset.id}&name=${encodeURIComponent(preset.name)}&examMonths=${JSON.stringify(preset.examMonths)}`
    })
  },

  onCustomAdd() {
    wx.navigateTo({
      url: '/pages/edit/edit'
    })
  }
})
