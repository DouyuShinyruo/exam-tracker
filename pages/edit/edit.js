// pages/edit/edit.js
const storage = require('../../utils/storage')
const { generateId, nowISO } = require('../../utils/date')

Page({
  data: {
    isEdit: false,
    examId: '',
    presetId: null,
    name: '',
    examDateType: 'exact', // 'exact' | 'approximate'
    examDate: '',
    examMonth: '',
    registrationDeadline: '',
    region: [],
    // Date picker constraints
    minDate: '',
    maxDate: '',
    // Preset info
    presetMonths: []
  },

  onLoad(options) {
    const now = new Date()
    const minDate = `${now.getFullYear()}-01-01`
    const maxDate = `${now.getFullYear() + 2}-12-31`

    if (options.id) {
      // Edit existing exam
      this.loadExam(options.id)
      this.setData({ isEdit: true, examId: options.id, minDate, maxDate })
      wx.setNavigationBarTitle({ title: '编辑考试' })
    } else if (options.presetId) {
      // From preset selection
      const name = decodeURIComponent(options.name || '')
      const examMonths = JSON.parse(options.examMonths || '[]')
      const defaultMonth = examMonths.length > 0 ? `${now.getFullYear()}-${String(examMonths[0]).padStart(2, '0')}` : ''
      this.setData({
        presetId: options.presetId,
        name,
        presetMonths: examMonths,
        examDateType: 'approximate',
        examMonth: defaultMonth,
        minDate,
        maxDate
      })
      wx.setNavigationBarTitle({ title: '添加考试' })
    } else {
      // Custom add
      this.setData({ minDate, maxDate })
      wx.setNavigationBarTitle({ title: '自定义添加' })
    }
  },

  loadExam(id) {
    const exam = storage.getExamById(id)
    if (!exam) {
      wx.showToast({ title: '考试不存在', icon: 'error' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    let examMonth = ''
    if (exam.examDateType === 'approximate') {
      const d = new Date(exam.examDate)
      examMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }

    this.setData({
      presetId: exam.presetId,
      name: exam.name,
      examDateType: exam.examDateType,
      examDate: exam.examDateType === 'exact' ? exam.examDate : '',
      examMonth,
      registrationDeadline: exam.registrationDeadline || '',
      region: exam.region ? exam.region.split(' ').slice(0, 2) : []
    })
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onDateTypeChange(e) {
    const type = e.detail.value ? 'approximate' : 'exact'
    this.setData({
      examDateType: type,
      examDate: '',
      examMonth: ''
    })
  },

  onExamDateChange(e) {
    this.setData({ examDate: e.detail.value })
  },

  onExamMonthChange(e) {
    this.setData({ examMonth: e.detail.value })
  },

  onDeadlineChange(e) {
    this.setData({ registrationDeadline: e.detail.value })
  },

  onRegionChange(e) {
    const [province, city] = e.detail.value
    this.setData({ region: [province, city] })
  },

  onClearDeadline() {
    this.setData({ registrationDeadline: '' })
  },

  onSave() {
    const { name, examDateType, examDate, examMonth, registrationDeadline, region } = this.data

    // Validation
    if (!name.trim()) {
      wx.showToast({ title: '请输入考试名称', icon: 'none' })
      return
    }

    let finalExamDate = ''
    if (examDateType === 'exact') {
      if (!examDate) {
        wx.showToast({ title: '请选择考试日期', icon: 'none' })
        return
      }
      finalExamDate = examDate
    } else {
      if (!examMonth) {
        wx.showToast({ title: '请选择考试月份', icon: 'none' })
        return
      }
      // Store as first day of month
      finalExamDate = examMonth + '-01'
    }

    const now = nowISO()
    const examData = {
      presetId: this.data.presetId,
      name: name.trim(),
      examDate: finalExamDate,
      examDateType,
      registrationDeadline: registrationDeadline || null,
      region: region.length > 0 ? region.join(' ') : null,
      source: 'manual',
      sourceUrl: null,
      lastSyncAt: null,
      updatedAt: now
    }

    if (this.data.isEdit) {
      storage.updateExam(this.data.examId, examData)
      wx.showToast({ title: '已更新', icon: 'success' })
    } else {
      examData.id = generateId()
      examData.createdAt = now
      storage.addExam(examData)
      wx.showToast({ title: '已添加', icon: 'success' })
    }

    setTimeout(() => wx.navigateBack(), 1500)
  },

  onShareAppMessage() {
    const { name, examDateType, examDate, examMonth, region } = this.data
    const dateStr = examDateType === 'approximate'
      ? `${examMonth}（预计）`
      : examDate
    const regionStr = region.length > 0 ? ` | ${region[0]} ${region[1]}` : ''
    return {
      title: `${name} - ${dateStr}${regionStr}`,
      path: '/pages/index/index'
    }
  }
})
