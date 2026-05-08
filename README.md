# 考证倒计时

一款微信小程序，帮你追踪各类证书考试的报名时间和考试日期，不再错过重要节点。

## 功能

- **预设考试目录** — 内置 30+ 常见考试（软考、教资、CPA、司法考试等），搜索即选
- **自定义添加** — 小众考试也能手动录入
- **倒计时展示** — 精确日期显示"距离考试还有 X 天"，大致月份显示"预计还有约 X 个月"
- **状态标签** — 报名中 / 即将截止 / 考试临近 / 已截止，一目了然
- **筛选功能** — 按报名中、考试临近快速筛选

## 技术栈

- 微信小程序原生框架（WXML + WXSS + JavaScript）
- 本地存储（wx.setStorageSync），后续可扩展后端同步

## 使用

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目目录 `exam-tracker/`
3. 在模拟器中预览运行

## 项目结构

```
├── app.js / app.json / app.wxss     # 应用入口
├── data/preset-exams.js              # 预设考试数据
├── utils/
│   ├── date.js                       # 日期工具
│   ├── status.js                     # 状态计算
│   ├── storage.js                    # 存储抽象层
│   └── local-storage.js              # 本地存储实现
├── components/exam-card/             # 考试卡片组件
└── pages/
    ├── index/                        # 首页（考试列表）
    ├── add/                          # 添加考试
    └── edit/                         # 编辑考试
```

## 后续计划

- 微信登录 + 数据云端同步
- 爬虫自动抓取考试信息
- 微信订阅消息推送提醒
- 日历视图 / 社交分享
