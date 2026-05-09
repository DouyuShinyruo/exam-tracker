// pages/teams/teams.js
const app = getApp()

Page({
  data: {
    teams: [],
    isEmpty: true,
    isLoading: true
  },

  onShow() {
    this.loadTeams()
  },

  loadTeams() {
    this.setData({ isLoading: true })
    wx.request({
      url: `${app.globalData.baseUrl}/api/teams`,
      header: { 'x-user-id': app.globalData.userId },
      success: (res) => {
        if (res.statusCode === 200) {
          const teams = res.data
          this.setData({
            teams,
            isEmpty: teams.length === 0,
            isLoading: false
          })
        } else {
          this.setData({ isLoading: false })
          wx.showToast({ title: '加载失败', icon: 'error' })
        }
      },
      fail: () => {
        this.setData({ isLoading: false })
        wx.showToast({ title: '网络错误', icon: 'error' })
      }
    })
  },

  onTeamTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/team-detail/team-detail?id=${id}`
    })
  },

  onCreateTeam() {
    wx.navigateTo({
      url: '/pages/create-team/create-team'
    })
  },

  onJoinTeam() {
    wx.showModal({
      title: '加入团队',
      content: '',
      editable: true,
      placeholderText: '请输入邀请码',
      success: (res) => {
        if (res.confirm && res.content) {
          this.joinTeam(res.content.trim())
        }
      }
    })
  },

  joinTeam(inviteCode) {
    wx.request({
      url: `${app.globalData.baseUrl}/api/teams/join`,
      method: 'POST',
      header: {
        'x-user-id': app.globalData.userId,
        'Content-Type': 'application/json'
      },
      data: { inviteCode },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ title: '已加入', icon: 'success' })
          this.loadTeams()
        } else {
          wx.showToast({ title: res.data.error || '加入失败', icon: 'error' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'error' })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '组队考证 - 一起备考不孤单',
      path: '/pages/index/index'
    }
  }
})
