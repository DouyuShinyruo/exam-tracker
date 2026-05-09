const express = require('express')
const router = express.Router()
const db = require('../db')
const axios = require('axios')

const APPID = process.env.WECHAT_APPID || ''
const SECRET = process.env.WECHAT_SECRET || ''

// WeChat login
router.post('/wx-login', async (req, res) => {
  const { code } = req.body
  if (!code) {
    return res.status(400).json({ error: 'Missing wx login code' })
  }

  try {
    // Exchange code for openid
    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: APPID,
        secret: SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })

    const { openid, session_key } = wxRes.data
    if (!openid) {
      return res.status(400).json({ error: 'Failed to get openid', detail: wxRes.data })
    }

    // Find or create user
    let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid)
    if (!user) {
      const result = db.prepare('INSERT INTO users (openid) VALUES (?)').run(openid)
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
    }

    res.json({
      userId: user.id,
      nickname: user.nickname,
      avatarUrl: user.avatar_url
    })
  } catch (err) {
    console.error('WeChat login error:', err.message)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Update user profile
router.put('/profile', (req, res) => {
  const { userId, nickname, avatarUrl } = req.body
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  db.prepare('UPDATE users SET nickname = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(nickname || null, avatarUrl || null, userId)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  res.json({ userId: user.id, nickname: user.nickname, avatarUrl: user.avatar_url })
})

module.exports = router
