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

  onExamShare(e) {
    const { exam } = e.detail
    const { formatDate, formatMonth } = require('../../utils/date')
    const dateStr = exam.examDateType === 'approximate'
      ? formatMonth(exam.examDate) + '（预计）'
      : formatDate(exam.examDate)
    const regionStr = exam.region ? ` | ${exam.region}` : ''

    wx.showActionSheet({
      itemList: ['分享给朋友', '复制考试信息'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // Trigger share via button - we'll use page share
          this._shareExam = exam
          wx.showShareMenu({ withShareTicket: true })
        } else if (res.tapIndex === 1) {
          const info = `【${exam.name}】\n考试时间：${dateStr}${regionStr}`
          wx.setClipboardData({
            data: info,
            success: () => wx.showToast({ title: '已复制', icon: 'success' })
          })
        }
      }
    })
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
  },

  onOpenTeams() {
    wx.navigateTo({
      url: '/pages/teams/teams'
    })
  },

  onShareAppMessage() {
    const { formatDate, formatMonth } = require('../../utils/date')
    const exam = this._shareExam
    if (exam) {
      const dateStr = exam.examDateType === 'approximate'
        ? formatMonth(exam.examDate) + '（预计）'
        : formatDate(exam.examDate)
      const regionStr = exam.region ? ` | ${exam.region}` : ''
      this._shareExam = null
      return {
        title: `${exam.name} - ${dateStr}${regionStr}`,
        path: '/pages/index/index'
      }
    }

    const { exams } = this.data
    const count = exams.length
    const title = count > 0
      ? `我正在追踪 ${count} 个考试，快来一起备考！`
      : '考证倒计时 - 不再错过重要考试'
    return {
      title,
      path: '/pages/index/index'
    }
  },

  onShareTimeline() {
    const { exams } = this.data
    const count = exams.length
    const title = count > 0
      ? `考证倒计时 | 追踪 ${count} 个考试`
      : '考证倒计时 - 不再错过重要考试'
    return {
      title
    }
  }
})
