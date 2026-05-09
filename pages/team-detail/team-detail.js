// pages/team-detail/team-detail.js
const app = getApp()

Page({
  data: {
    teamId: '',
    team: null,
    members: [],
    isCreator: false,
    isLoading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ teamId: options.id })
      this.loadTeam(options.id)
    }
  },

  onShow() {
    if (this.data.teamId) {
      this.loadTeam(this.data.teamId)
    }
  },

  loadTeam(id) {
    this.setData({ isLoading: true })
    wx.request({
      url: `${app.globalData.baseUrl}/api/teams/${id}`,
      header: { 'x-user-id': app.globalData.userId },
      success: (res) => {
        if (res.statusCode === 200) {
          const team = res.data
          this.setData({
            team,
            members: team.members || [],
            isCreator: team.isCreator || false,
            isLoading: false
          })
          wx.setNavigationBarTitle({ title: team.name })
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

  onCopyInviteCode() {
    const { inviteCode } = this.data.team
    wx.setClipboardData({
      data: inviteCode,
      success: () => wx.showToast({ title: '已复制邀请码', icon: 'success' })
    })
  },

  onShareInvite() {
    // This will be handled by onShareAppMessage
  },

  onLeaveTeam() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出这个团队吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.baseUrl}/api/teams/${this.data.teamId}/leave`,
            method: 'POST',
            header: { 'x-user-id': app.globalData.userId },
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({ title: '已退出', icon: 'success' })
                setTimeout(() => wx.navigateBack(), 1500)
              } else {
                wx.showToast({ title: res.data.error || '退出失败', icon: 'error' })
              }
            },
            fail: () => wx.showToast({ title: '网络错误', icon: 'error' })
          })
        }
      }
    })
  },

  onDeleteTeam() {
    wx.showModal({
      title: '确认解散',
      content: '解散后团队将永久删除，确定要解散吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.baseUrl}/api/teams/${this.data.teamId}`,
            method: 'DELETE',
            header: { 'x-user-id': app.globalData.userId },
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({ title: '已解散', icon: 'success' })
                setTimeout(() => wx.navigateBack(), 1500)
              } else {
                wx.showToast({ title: res.data.error || '解散失败', icon: 'error' })
              }
            },
            fail: () => wx.showToast({ title: '网络错误', icon: 'error' })
          })
        }
      }
    })
  },

  onShareAppMessage() {
    const { team } = this.data
    if (!team) return {}
    return {
      title: `邀请你加入「${team.name}」一起备考`,
      path: `/pages/team-detail/team-detail?id=${team.id}&inviteCode=${team.inviteCode}`
    }
  },

  onShareTimeline() {
    const { team } = this.data
    if (!team) return {}
    return {
      title: `组队考证 | ${team.name}`
    }
  }
})
