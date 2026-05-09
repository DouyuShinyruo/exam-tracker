const axios = require('axios')
const db = require('../db')

const APPID = process.env.WECHAT_APPID || ''
const SECRET = process.env.WECHAT_SECRET || ''

// Get access token from WeChat
async function getAccessToken() {
  try {
    const res = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: APPID,
        secret: SECRET
      }
    })
    return res.data.access_token
  } catch (error) {
    console.error('Failed to get access token:', error.message)
    return null
  }
}

// Send subscription message to user
async function sendSubscribeMessage(openid, templateId, data, page = '') {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    console.error('No access token available')
    return false
  }

  try {
    const res = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
      {
        touser: openid,
        template_id: templateId,
        page,
        data
      }
    )

    if (res.data.errcode === 0) {
      console.log(`Message sent to ${openid}`)
      return true
    } else {
      console.error('Send message failed:', res.data)
      return false
    }
  } catch (error) {
    console.error('Send message error:', error.message)
    return false
  }
}

// Check and send exam reminders
async function sendExamReminders() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  const nextWeekStr = nextWeek.toISOString().split('T')[0]

  // Find exams happening tomorrow or within 7 days
  const exams = db.prepare(`
    SELECT e.*, u.openid FROM exams e
    JOIN users u ON e.user_id = u.id
    WHERE e.exam_date >= ? AND e.exam_date <= ?
  `).all(tomorrowStr, nextWeekStr)

  for (const exam of exams) {
    const daysUntil = Math.ceil((new Date(exam.exam_date) - now) / (1000 * 60 * 60 * 24))

    let templateId = '' // You need to configure this with your actual template ID
    let data = {}

    if (daysUntil <= 1) {
      // Exam tomorrow
      templateId = 'your_exam_tomorrow_template_id'
      data = {
        thing1: { value: exam.name },
        date2: { value: exam.exam_date },
        thing3: { value: '明天考试，注意准备！' }
      }
    } else if (daysUntil <= 7) {
      // Exam within a week
      templateId = 'your_exam_week_template_id'
      data = {
        thing1: { value: exam.name },
        date2: { value: exam.exam_date },
        thing3: { value: `还有${daysUntil}天考试` }
      }
    }

    if (templateId) {
      await sendSubscribeMessage(exam.openid, templateId, data, `/pages/edit/edit?id=${exam.id}`)
    }
  }

  console.log(`Sent reminders for ${exams.length} exams`)
}

// Check and send registration deadline reminders
async function sendDeadlineReminders() {
  const now = new Date()
  const threeDaysLater = new Date(now)
  threeDaysLater.setDate(threeDaysLater.getDate() + 3)
  const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0]
  const nowStr = now.toISOString().split('T')[0]

  const exams = db.prepare(`
    SELECT e.*, u.openid FROM exams e
    JOIN users u ON e.user_id = u.id
    WHERE e.registration_deadline >= ? AND e.registration_deadline <= ?
  `).all(nowStr, threeDaysLaterStr)

  for (const exam of exams) {
    const daysUntil = Math.ceil((new Date(exam.registration_deadline) - now) / (1000 * 60 * 60 * 24))

    const templateId = 'your_deadline_template_id'
    const data = {
      thing1: { value: exam.name },
      date2: { value: exam.registration_deadline },
      thing3: { value: `报名还有${daysUntil}天截止！` }
    }

    await sendSubscribeMessage(exam.openid, templateId, data, `/pages/edit/edit?id=${exam.id}`)
  }

  console.log(`Sent deadline reminders for ${exams.length} exams`)
}

module.exports = {
  sendSubscribeMessage,
  sendExamReminders,
  sendDeadlineReminders
}
