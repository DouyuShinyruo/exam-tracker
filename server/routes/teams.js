const express = require('express')
const router = express.Router()
const db = require('../db')
const authMiddleware = require('../middleware/auth')

// Apply auth middleware to all routes
router.use(authMiddleware)

// Generate random invite code
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a team
router.post('/', (req, res) => {
  const { name, examName, examDate } = req.body
  const userId = req.user.id

  if (!name || !examName) {
    return res.status(400).json({ error: 'Team name and exam name are required' })
  }

  let inviteCode
  let attempts = 0
  do {
    inviteCode = generateInviteCode()
    attempts++
    const existing = db.prepare('SELECT id FROM teams WHERE invite_code = ?').get(inviteCode)
    if (!existing) break
  } while (attempts < 10)

  const insertTeam = db.prepare(`
    INSERT INTO teams (name, exam_name, exam_date, invite_code, creator_id)
    VALUES (?, ?, ?, ?, ?)
  `)

  const insertMember = db.prepare(`
    INSERT INTO team_members (team_id, user_id)
    VALUES (?, ?)
  `)

  const result = db.transaction(() => {
    const result = insertTeam.run(name, examName, examDate || null, inviteCode, userId)
    const teamId = result.lastInsertRowid
    insertMember.run(teamId, userId)
    return teamId
  })()

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(result)
  res.json(formatTeam(team))
})

// Get user's teams
router.get('/', (req, res) => {
  const userId = req.user.id

  const teams = db.prepare(`
    SELECT t.* FROM teams t
    INNER JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = ?
    ORDER BY t.created_at DESC
  `).all(userId)

  const result = teams.map(team => {
    const members = getTeamMembers(team.id)
    return { ...formatTeam(team), members, memberCount: members.length }
  })

  res.json(result)
})

// Get team by invite code
router.get('/invite/:code', (req, res) => {
  const { code } = req.params
  const team = db.prepare('SELECT * FROM teams WHERE invite_code = ?').get(code.toUpperCase())

  if (!team) {
    return res.status(404).json({ error: 'Team not found' })
  }

  const members = getTeamMembers(team.id)
  res.json({ ...formatTeam(team), members, memberCount: members.length })
})

// Get team detail
router.get('/:id', (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(id)
  if (!team) {
    return res.status(404).json({ error: 'Team not found' })
  }

  // Check if user is a member
  const membership = db.prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?').get(id, userId)
  if (!membership) {
    return res.status(403).json({ error: 'You are not a member of this team' })
  }

  const members = getTeamMembers(id)
  const isCreator = team.creator_id === userId
  res.json({ ...formatTeam(team), members, memberCount: members.length, isCreator })
})

// Join team
router.post('/join', (req, res) => {
  const { inviteCode } = req.body
  const userId = req.user.id

  if (!inviteCode) {
    return res.status(400).json({ error: 'Invite code is required' })
  }

  const team = db.prepare('SELECT * FROM teams WHERE invite_code = ?').get(inviteCode.toUpperCase())
  if (!team) {
    return res.status(404).json({ error: 'Invalid invite code' })
  }

  // Check if already a member
  const existing = db.prepare('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?').get(team.id, userId)
  if (existing) {
    return res.status(400).json({ error: 'You are already a member of this team' })
  }

  // Check member limit
  const memberCount = db.prepare('SELECT COUNT(*) as count FROM team_members WHERE team_id = ?').get(team.id).count
  if (memberCount >= team.max_members) {
    return res.status(400).json({ error: 'Team is full' })
  }

  db.prepare('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)').run(team.id, userId)

  const members = getTeamMembers(team.id)
  res.json({ ...formatTeam(team), members, memberCount: members.length })
})

// Leave team
router.post('/:id/leave', (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(id)
  if (!team) {
    return res.status(404).json({ error: 'Team not found' })
  }

  if (team.creator_id === userId) {
    return res.status(400).json({ error: 'Creator cannot leave the team. Delete it instead.' })
  }

  const result = db.prepare('DELETE FROM team_members WHERE team_id = ? AND user_id = ?').run(id, userId)
  if (result.changes === 0) {
    return res.status(400).json({ error: 'You are not a member of this team' })
  }

  res.json({ success: true })
})

// Delete team (creator only)
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(id)
  if (!team) {
    return res.status(404).json({ error: 'Team not found' })
  }

  if (team.creator_id !== userId) {
    return res.status(403).json({ error: 'Only the creator can delete the team' })
  }

  db.transaction(() => {
    db.prepare('DELETE FROM team_members WHERE team_id = ?').run(id)
    db.prepare('DELETE FROM teams WHERE id = ?').run(id)
  })()

  res.json({ success: true })
})

function getTeamMembers(teamId) {
  return db.prepare(`
    SELECT u.id, u.nickname, u.avatar_url, tm.joined_at
    FROM team_members tm
    INNER JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = ?
    ORDER BY tm.joined_at ASC
  `).all(teamId).map(m => ({
    id: m.id,
    nickname: m.nickname || '微信用户',
    avatarUrl: m.avatar_url,
    joinedAt: m.joined_at
  }))
}

function formatTeam(team) {
  return {
    id: team.id,
    name: team.name,
    examName: team.exam_name,
    examDate: team.exam_date,
    inviteCode: team.invite_code,
    creatorId: team.creator_id,
    maxMembers: team.max_members,
    createdAt: team.created_at
  }
}

module.exports = router
