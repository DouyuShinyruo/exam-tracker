const express = require('express')
const router = express.Router()
const db = require('../db')
const authMiddleware = require('../middleware/auth')

// Get all exams for user
router.get('/', authMiddleware, (req, res) => {
  const exams = db.prepare('SELECT * FROM exams WHERE user_id = ? ORDER BY exam_date ASC').all(req.user.id)
  res.json(exams.map(formatExam))
})

// Get single exam
router.get('/:id', authMiddleware, (req, res) => {
  const exam = db.prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!exam) return res.status(404).json({ error: 'Exam not found' })
  res.json(formatExam(exam))
})

// Create exam
router.post('/', authMiddleware, (req, res) => {
  const { id, presetId, name, examDate, examDateType, registrationDeadline, region, source, sourceUrl } = req.body

  if (!name || !examDate) {
    return res.status(400).json({ error: 'Name and examDate are required' })
  }

  const examId = id || `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  db.prepare(`
    INSERT INTO exams (id, user_id, preset_id, name, exam_date, exam_date_type, registration_deadline, region, source, source_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(examId, req.user.id, presetId || null, name, examDate, examDateType || 'exact', registrationDeadline || null, region || null, source || 'manual', sourceUrl || null)

  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(examId)
  res.status(201).json(formatExam(exam))
})

// Update exam
router.put('/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!existing) return res.status(404).json({ error: 'Exam not found' })

  const { name, examDate, examDateType, registrationDeadline, region } = req.body

  db.prepare(`
    UPDATE exams SET name = ?, exam_date = ?, exam_date_type = ?, registration_deadline = ?, region = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(
    name || existing.name,
    examDate || existing.exam_date,
    examDateType || existing.exam_date_type,
    registrationDeadline !== undefined ? registrationDeadline : existing.registration_deadline,
    region !== undefined ? region : existing.region,
    req.params.id,
    req.user.id
  )

  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.id)
  res.json(formatExam(exam))
})

// Delete exam
router.delete('/:id', authMiddleware, (req, res) => {
  const result = db.prepare('DELETE FROM exams WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Exam not found' })
  res.json({ success: true })
})

function formatExam(row) {
  return {
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
  }
}

module.exports = router
