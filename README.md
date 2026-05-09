# 考证倒计时

一款微信小程序，帮你追踪各类证书考试的报名时间和考试日期，不再错过重要节点。

## 功能

- **预设考试目录** — 内置 30+ 常见考试（软考、教资、CPA、司法考试等），搜索即选
- **自定义添加** — 小众考试也能手动录入
- **倒计时展示** — 精确日期显示"距离考试还有 X 天"，大致月份显示"预计还有约 X 个月"
- **状态标签** — 报名中 / 即将截止 / 考试临近 / 已截止，一目了然
- **筛选功能** — 按报名中、考试临近快速筛选
- **日历视图** — 月历展示考试分布，点击日期查看详情
- **云端同步** — 微信登录后数据多设备同步
- **消息推送** — 考试临近和报名截止提醒
- **社交分享** — 分享给好友、分享到朋友圈
- **组队考证** — 创建团队、邀请好友、一起备考

## 技术栈

**前端（小程序）：**
- 微信小程序原生框架（WXML + WXSS + JavaScript）
- 存储抽象层，支持本地存储 / 后端 API 切换

**后端：**
- Node.js + Express
- SQLite（better-sqlite3）
- 定时爬虫（node-cron）
- 微信订阅消息推送

## 使用

### 小程序端
1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目目录
3. 在模拟器中预览运行

### 后端服务
```bash
cd server
cp .env.example .env  # 填入微信小程序 appid 和 secret
npm install
npm run dev
```

## 项目结构

```
├── app.js / app.json / app.wxss     # 应用入口
├── data/preset-exams.js              # 预设考试数据
├── utils/
│   ├── date.js                       # 日期工具
│   ├── status.js                     # 状态计算
│   ├── storage.js                    # 存储抽象层
│   ├── local-storage.js              # 本地存储实现
│   └── api-storage.js                # 后端 API 存储实现
├── components/exam-card/             # 考试卡片组件
├── pages/
│   ├── index/                        # 首页（考试列表）
│   ├── add/                          # 添加考试
│   ├── edit/                         # 编辑考试
│   ├── calendar/                     # 日历视图
│   ├── teams/                        # 团队列表
│   ├── team-detail/                  # 团队详情
│   └── create-team/                  # 创建团队
└── server/                           # 后端服务
    ├── app.js                        # Express 入口
    ├── db.js                         # SQLite 数据库
    ├── routes/                       # API 路由
    │   ├── exams.js                  # 考试 CRUD
    │   ├── preset-exams.js           # 预设考试
    │   ├── auth.js                   # 微信登录
    │   ├── sync.js                   # 数据同步
    │   └── teams.js                  # 团队管理
    └── services/
        ├── crawler.js                # 考试信息爬虫
        ├── scheduler.js              # 定时任务
        ├── notification.js           # 消息推送
        └── preset-service.js         # 预设数据初始化
```

## 后续计划

- 社交功能：分享给朋友，组队考证
- 管理后台
