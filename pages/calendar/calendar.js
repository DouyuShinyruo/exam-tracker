// pages/calendar/calendar.js
const storage = require('../../utils/storage')
const { getExamStatus, getCountdownText } = require('../../utils/status')
const { formatDate, formatMonth } = require('../../utils/date')

Page({
  data: {
    year: 0,
    month: 0,
    days: [],
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    selectedDate: '',
    selectedExams: [],
    examMap: {}
  },

  onLoad() {
    const now = new Date()
    this.setData({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      selectedDate: formatDate(now)
    })
  },

  onShow() {
    this.loadExams()
    this.buildCalendar()
  },

  loadExams() {
    const exams = storage.getExams()
    const examMap = {}

    exams.forEach(exam => {
      const status = getExamStatus(exam.examDate, exam.registrationDeadline)
      const countdownText = getCountdownText(exam)
      const dateDisplay = exam.examDateType === 'approximate'
        ? formatMonth(exam.examDate) + '（预计）'
        : formatDate(exam.examDate)

      const enriched = { ...exam, status, countdownText, dateDisplay }

      // For approximate dates, also mark the 1st of the month
      const dateKey = exam.examDate
      if (!examMap[dateKey]) examMap[dateKey] = []
      examMap[dateKey].push(enriched)
    })

    this.setData({ examMap })
  },

  buildCalendar() {
    const { year, month, examMap } = this.data
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const totalDays = lastDay.getDate()

    // Monday=0, Sunday=6
    let startWeekday = firstDay.getDay() - 1
    if (startWeekday < 0) startWeekday = 6

    const days = []

    // Previous month padding
    const prevLastDay = new Date(year, month - 1, 0).getDate()
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push({
        day: prevLastDay - i,
        date: '',
        isCurrentMonth: false,
        hasExam: false,
        examCount: 0
      })
    }

    // Current month days
    const today = formatDate(new Date())
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayExams = examMap[dateStr] || []
      days.push({
        day: d,
        date: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today,
        hasExam: dayExams.length > 0,
        examCount: dayExams.length,
        exams: dayExams
      })
    }

    // Next month padding (fill to 42 cells = 6 rows)
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        date: '',
        isCurrentMonth: false,
        hasExam: false,
        examCount: 0
      })
    }

    this.setData({ days })
  },

  onPrevMonth() {
    let { year, month } = this.data
    month--
    if (month < 1) {
      month = 12
      year--
    }
    this.setData({ year, month, selectedDate: '', selectedExams: [] })
    this.buildCalendar()
  },

  onNextMonth() {
    let { year, month } = this.data
    month++
    if (month > 12) {
      month = 1
      year++
    }
    this.setData({ year, month, selectedDate: '', selectedExams: [] })
    this.buildCalendar()
  },

  onDayTap(e) {
    const { date, exams } = e.currentTarget.dataset
    if (!date) return
    this.setData({
      selectedDate: date,
      selectedExams: exams || []
    })
  },

  onExamTap(e) {
    const { exam } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/edit/edit?id=${exam.id}`
    })
  },

  onShareAppMessage() {
    const { year, month } = this.data
    return {
      title: `${year}年${month}月考试日历 - 考证倒计时`,
      path: '/pages/index/index'
    }
  },

  onShareTimeline() {
    const { year, month } = this.data
    return {
      title: `${year}年${month}月考试日历`
    }
  }
})
