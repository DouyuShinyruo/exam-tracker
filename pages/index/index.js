// pages/index/index.js
const storage = require('../../utils/storage')
const { getExamStatus } = require('../../utils/status')

Page({
  data: {
    exams: [],
    filteredExams: [],
    currentFilter: 'all',
    filters: [
      { key: 'all', label: '全部' },
      { key: 'registering', label: '报名中' },
      { key: 'examSoon', label: '考试临近' }
    ],
    isEmpty: true
  },

  onShow() {
    this.loadExams()
  },

  loadExams() {
    const exams = storage.getExams()
    // Sort by exam date (nearest first)
    exams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
    this.setData({
      exams,
      isEmpty: exams.length === 0
    })
    this.applyFilter()
  },

  applyFilter() {
    const { exams, currentFilter } = this.data
    let filtered = exams

    if (currentFilter === 'registering') {
      filtered = exams.filter(e => {
        const status = getExamStatus(e.examDate, e.registrationDeadline)
        return status.key === 'registering' || status.key === 'deadlineSoon'
      })
    } else if (currentFilter === 'examSoon') {
      filtered = exams.filter(e => {
        const status = getExamStatus(e.examDate, e.registrationDeadline)
        return status.key === 'examSoon'
      })
    }

    this.setData({ filteredExams: filtered })
  },

  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.applyFilter()
  },

  onExamTap(e) {
    const { exam } = e.detail
    wx.navigateTo({
      url: `/pages/edit/edit?id=${exam.id}`
    })
  },

  onExamDelete(e) {
    const { id } = e.detail
    storage.deleteExam(id)
    this.loadExams()
    wx.showToast({ title: '已删除', icon: 'success' })
  },

  onAddExam() {
    wx.navigateTo({
      url: '/pages/add/add'
    })
  },

  onOpenCalendar() {
    wx.navigateTo({
      url: '/pages/calendar/calendar'
    })
  }
})
