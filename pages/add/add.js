// pages/add/add.js
const { searchPresetExams, groupByCategory, presetExams } = require('../../data/preset-exams')

function withMonthText(exams) {
  return exams.map(e => ({
    ...e,
    monthText: e.examMonths.map(m => m + '月').join('、')
  }))
}

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
    const groupedExams = groupByCategory(withMonthText(presetExams))
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

    const results = withMonthText(searchPresetExams(keyword))
    this.setData({
      searchResults: results,
      showResults: true,
      groupedExams: results.length > 0 ? groupByCategory(results) : {}
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
