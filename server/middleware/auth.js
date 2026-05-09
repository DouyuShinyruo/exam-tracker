const db = require('../db')

function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id']
  if (!userId) {
    return res.status(401).json({ error: 'Missing user ID' })
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!user) {
    return res.status(401).json({ error: 'User not found' })
  }

  req.user = user
  next()
}

module.exports = authMiddleware
