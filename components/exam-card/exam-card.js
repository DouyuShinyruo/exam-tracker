// components/exam-card/exam-card.js
const { formatDate, formatMonth } = require('../../utils/date')
const { getExamStatus, getCountdownText } = require('../../utils/status')

Component({
  properties: {
    exam: {
      type: Object,
      value: {}
    }
  },

  data: {
    status: {},
    countdownText: '',
    dateDisplay: ''
  },

  observers: {
    'exam': function(exam) {
      if (!exam || !exam.id) return
      const status = getExamStatus(exam.examDate, exam.registrationDeadline)
      const countdownText = getCountdownText(exam)
      const dateDisplay = exam.examDateType === 'approximate'
        ? formatMonth(exam.examDate) + '（预计）'
        : formatDate(exam.examDate)
      this.setData({ status, countdownText, dateDisplay })
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { exam: this.data.exam })
    },

    onShare() {
      this.triggerEvent('share', { exam: this.data.exam })
    },

    onDelete() {
      wx.showModal({
        title: '确认删除',
        content: `确定要删除「${this.data.exam.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('delete', { id: this.data.exam.id })
          }
        }
      })
    }
  }
})
