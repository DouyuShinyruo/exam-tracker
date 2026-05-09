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

// Get single preset exam
router.get('/:id', (req, res) => {
  const exam = db.prepare('SELECT * FROM preset_exams WHERE id = ?').get(req.params.id)
  if (!exam) return res.status(404).json({ error: 'Preset exam not found' })
  res.json(formatPreset(exam))
})

function formatPreset(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    examMonths: row.exam_months ? JSON.parse(row.exam_months) : [],
    officialUrl: row.official_url,
    description: row.description
  }
}

module.exports = router
