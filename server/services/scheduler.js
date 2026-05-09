const cron = require('node-cron')
const { crawlAll } = require('./crawler')
const { sendExamReminders, sendDeadlineReminders } = require('./notification')

function startScheduler() {
  // Run crawler every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running scheduled crawl job...')
    try {
      const result = await crawlAll()
      console.log('Scheduled crawl result:', result)
    } catch (error) {
      console.error('Scheduled crawl failed:', error)
    }
  })

  // Send exam reminders every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Sending exam reminders...')
    try {
      await sendExamReminders()
    } catch (error) {
      console.error('Exam reminders failed:', error)
    }
  })

  // Send deadline reminders every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Sending deadline reminders...')
    try {
      await sendDeadlineReminders()
    } catch (error) {
      console.error('Deadline reminders failed:', error)
    }
  })

  console.log('Scheduler started:')
  console.log('  - Crawler: daily at 2:00 AM')
  console.log('  - Exam reminders: daily at 8:00 AM')
  console.log('  - Deadline reminders: daily at 9:00 AM')
}

module.exports = { startScheduler }
