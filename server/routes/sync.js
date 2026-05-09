const express = require('express')
const router = express.Router()
const db = require('../db')
const authMiddleware = require('../middleware/auth')

// Sync exams - upload local exams and download server exams
router.post('/', authMiddleware, (req, res) => {
  const { exams: localExams, lastSyncAt } = req.body
  const userId = req.user.id

  const serverExams = db.prepare('SELECT * FROM exams WHERE user_id = ?').all(userId)
  const serverExamMap = {}
  serverExams.forEach(e => { serverExamMap[e.id] = e })

  const uploaded = []
  const downloaded = []

  // Upload local exams to server
  if (localExams && localExams.length > 0) {
    const upsert = db.prepare(`
      INSERT INTO exams (id, user_id, preset_id, name, exam_date, exam_date_type, registration_deadline, region, source, source_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        exam_date = excluded.exam_date,
        exam_date_type = excluded.exam_date_type,
        registration_deadline = excluded.registration_deadline,
        region = excluded.region,
        updated_at = excluded.updated_at
    `)

    const insertMany = db.transaction((exams) => {
      for (const exam of exams) {
        upsert.run(
          exam.id, userId, exam.presetId || null, exam.name,
          exam.examDate, exam.examDateType || 'exact',
          exam.registrationDeadline || null, exam.region || null,
          exam.source || 'manual', exam.sourceUrl || null,
          exam.createdAt || new Date().toISOString(),
          exam.updatedAt || new Date().toISOString()
        )
        uploaded.push(exam.id)
      }
    })
    insertMany(localExams)
  }

  // Download all server exams for this user
  const allExams = db.prepare('SELECT * FROM exams WHERE user_id = ?').all(userId)
  const formattedExams = allExams.map(row => ({
    id: row.id,
    presetId: row.preset_id,
    name: row.name,
    examDate: row.exam_date,
    examDateType: row.exam_date_type,
    registrationDeadline: row.registration_deadline,
    region: row.region,
    source: row.source,
    sourceUrl: row.source_url,
    lastSyncAt: row.last_sync_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))

  // Log sync
  db.prepare('INSERT INTO sync_log (user_id, exam_count) VALUES (?, ?)').run(userId, formattedExams.length)

  res.json({
    exams: formattedExams,
    syncedAt: new Date().toISOString(),
    uploaded: uploaded.length,
    downloaded: formattedExams.length
  })
})

// Get last sync time
router.get('/last', authMiddleware, (req, res) => {
  const log = db.prepare('SELECT * FROM sync_log WHERE user_id = ? ORDER BY synced_at DESC LIMIT 1').get(req.user.id)
  res.json({ lastSyncAt: log ? log.synced_at : null })
})

module.exports = router
