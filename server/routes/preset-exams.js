const express = require('express')
const router = express.Router()
const db = require('../db')

// Get all preset exams
router.get('/', (req, res) => {
  const { category, keyword } = req.query
  let sql = 'SELECT * FROM preset_exams'
  const params = []

  if (category) {
    sql += ' WHERE category = ?'
    params.push(category)
  } else if (keyword) {
    sql += ' WHERE name LIKE ? OR category LIKE ? OR description LIKE ?'
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }

  sql += ' ORDER BY category, name'
  const exams = db.prepare(sql).all(...params)
  res.json(exams.map(formatPreset))
})

// Get categories
router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM preset_exams ORDER BY category').all()
  res.json(rows.map(r => r.category))
})

// Get last update time
router.get('/last-update', (req, res) => {
  const row = db.prepare('SELECT MAX(updated_at) as lastUpdate FROM preset_exams').get()
  res.json({ lastUpdate: row.lastUpdate || null })
})

// Get single preset exam
router.get('/:id', (req, res) => {
  const exam = db.prepare('SELECT * FROM preset_exams WHERE id = ?').get(req.params.id)
  if (!exam) return res.status(404).json({ error: 'Preset exam not found' })
  res.json(formatPreset(exam))
})

// Update a single preset exam
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { name, category, examMonths, officialUrl, description } = req.body

  const existing = db.prepare('SELECT * FROM preset_exams WHERE id = ?').get(id)
  if (!existing) {
    return res.status(404).json({ error: 'Preset exam not found' })
  }

  const updates = []
  const params = []

  if (name !== undefined) { updates.push('name = ?'); params.push(name) }
  if (category !== undefined) { updates.push('category = ?'); params.push(category) }
  if (examMonths !== undefined) { updates.push('exam_months = ?'); params.push(JSON.stringify(examMonths)) }
  if (officialUrl !== undefined) { updates.push('official_url = ?'); params.push(officialUrl) }
  if (description !== undefined) { updates.push('description = ?'); params.push(description) }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' })
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  params.push(id)

  db.prepare(`UPDATE preset_exams SET ${updates.join(', ')} WHERE id = ?`).run(...params)

  const updated = db.prepare('SELECT * FROM preset_exams WHERE id = ?').get(id)
  res.json(formatPreset(updated))
})

// Batch update preset exams
router.post('/batch', (req, res) => {
  const { exams } = req.body

  if (!Array.isArray(exams)) {
    return res.status(400).json({ error: 'exams must be an array' })
  }

  const upsert = db.prepare(`
    INSERT INTO preset_exams (id, name, category, exam_months, official_url, description)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      exam_months = excluded.exam_months,
      official_url = excluded.official_url,
      description = excluded.description,
      updated_at = CURRENT_TIMESTAMP
  `)

  const results = db.transaction((items) => {
    const processed = []
    for (const exam of items) {
      if (!exam.id || !exam.name || !exam.category) continue
      upsert.run(
        exam.id,
        exam.name,
        exam.category,
        JSON.stringify(exam.examMonths || []),
        exam.officialUrl || '',
        exam.description || ''
      )
      processed.push(exam.id)
    }
    return processed
  })(exams)

  res.json({ success: true, updated: results.length, ids: results })
})

// Delete a preset exam
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const result = db.prepare('DELETE FROM preset_exams WHERE id = ?').run(id)
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Preset exam not found' })
  }
  res.json({ success: true })
})

function formatPreset(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    examMonths: row.exam_months ? JSON.parse(row.exam_months) : [],
    officialUrl: row.official_url,
    description: row.description,
    updatedAt: row.updated_at
  }
}

module.exports = router
