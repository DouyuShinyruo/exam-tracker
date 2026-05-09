// pages/create-team/create-team.js
const app = getApp()
const storage = require('../../utils/storage')

Page({
  data: {
    teamName: '',
    examName: '',
    examDate: '',
    exams: [],
    showExamPicker: false,
    minDate: '',
    maxDate: ''
  },

  onLoad() {
    const now = new Date()
    const minDate = `${now.getFullYear()}-01-01`
    const maxDate = `${now.getFullYear() + 2}-12-31`
    this.setData({ minDate, maxDate })
    this.loadExams()
  },

  loadExams() {
    const exams = storage.getExams()
    this.setData({ exams })
  },

  onTeamNameInput(e) {
    this.setData({ teamName: e.detail.value })
  },

  onExamNameInput(e) {
    this.setData({ examName: e.detail.value })
  },

  onSelectExam() {
    this.setData({ showExamPicker: true })
  },

  onExamPickerChange(e) {
    const index = e.detail.value
    const exam = this.data.exams[index]
    if (exam) {
      this.setData({
        examName: exam.name,
        examDate: exam.examDate,
        showExamPicker: false
      })
    }
  },

  onExamDateChange(e) {
    this.setData({ examDate: e.detail.value })
  },

  onClearExamDate() {
    this.setData({ examDate: '' })
  },

  onCreate() {
    const { teamName, examName, examDate } = this.data

    if (!teamName.trim()) {
      wx.showToast({ title: '请输入团队名称', icon: 'none' })
      return
    }

    if (!examName.trim()) {
      wx.showToast({ title: '请输入考试名称', icon: 'none' })
      return
    }

    wx.request({
      url: `${app.globalData.baseUrl}/api/teams`,
      method: 'POST',
      header: {
        'x-user-id': app.globalData.userId,
        'Content-Type': 'application/json'
      },
      data: {
        name: teamName.trim(),
        examName: examName.trim(),
        examDate: examDate || null
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ title: '创建成功', icon: 'success' })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          wx.showToast({ title: res.data.error || '创建失败', icon: 'error' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'error' })
      }
    })
  }
})
