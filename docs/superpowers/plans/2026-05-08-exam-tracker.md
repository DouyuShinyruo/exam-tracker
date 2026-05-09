# 考证倒计时小程序 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WeChat Mini Program that tracks certification exam dates with countdown display, supporting both preset exam selection and custom entry.

**Architecture:** WeChat Mini Program with local storage. Data layer abstracted via storage interface for future backend migration. Preset exam catalog embedded as static data.

**Tech Stack:** WeChat Mini Program (WXML + WXSS + JavaScript), WeChat Developer Tools

---

## File Structure

```
exam-tracker/
├── app.js                          # App entry, global initialization
├── app.json                        # App config (pages, tabBar, window)
├── app.wxss                        # Global styles
├── project.config.json             # Project config
├── sitemap.json                    # WeChat sitemap
├── data/
│   └── preset-exams.js             # Preset exam catalog (30-50 items)
├── utils/
│   ├── storage.js                  # Storage abstraction layer
│   ├── local-storage.js            # Local storage implementation
│   ├── date.js                     # Date formatting & countdown utils
│   └── status.js                   # Exam status calculation
├── pages/
│   ├── index/                      # Home page (exam list)
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── add/                        # Add exam (search preset / custom)
│   │   ├── add.js
│   │   ├── add.json
│   │   ├── add.wxml
│   │   └── add.wxss
│   └── edit/                       # Edit exam form
│       ├── edit.js
│       ├── edit.json
│       ├── edit.wxml
│       └── edit.wxss
└── components/
    └── exam-card/                  # Reusable exam card component
        ├── exam-card.js
        ├── exam-card.json
        ├── exam-card.wxml
        └── exam-card.wxss
```

---

### Task 1: Project Initialization

**Files:**
- Create: `exam-tracker/app.js`
- Create: `exam-tracker/app.json`
- Create: `exam-tracker/app.wxss`
- Create: `exam-tracker/project.config.json`
- Create: `exam-tracker/sitemap.json`

- [ ] **Step 1: Create project directory structure**

```bash
mkdir -p exam-tracker/{data,utils,pages/{index,add,edit},components/exam-card}
```

- [ ] **Step 2: Create app.json**

```json
{
  "pages": [
    "pages/index/index",
    "pages/add/add",
    "pages/edit/edit"
  ],
  "window": {
    "navigationBarBackgroundColor": "#1890FF",
    "navigationBarTitleText": "考证倒计时",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#F5F5F5"
  },
  "sitemapLocation": "sitemap.json",
  "style": "v2"
}
```

- [ ] **Step 3: Create app.js**

```javascript
App({
  onLaunch() {
    console.log('Exam Tracker launched')
  },
  globalData: {
    version: '1.0.0'
  }
})
```

- [ ] **Step 4: Create app.wxss**

```css
page {
  background-color: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 28rpx;
  color: #333;
}

.container {
  padding: 20rpx;
}
```

- [ ] **Step 5: Create project.config.json**

```json
{
  "description": "考证倒计时小程序",
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "setting": {
    "bundle": false,
    "userConfirmedBundleSwitch": false,
    "urlCheck": true,
    "scopeDataCheck": false,
    "coverView": true,
    "es6": true,
    "postcss": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "preloadBackgroundData": false,
    "minified": true,
    "autoAudits": false,
    "newFeature": false,
    "uglifyFileName": false,
    "uploadWithSourceMap": true,
    "useIsolateContext": true,
    "nodeModules": false,
    "enhance": true,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "showShadowRootInWxmlPanel": true,
    "packNpmManually": false,
    "enableEngineNative": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "showES6CompileOption": false,
    "minifyWXML": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    }
  },
  "compileType": "miniprogram",
  "libVersion": "2.25.4",
  "appid": "touristappid",
  "projectname": "exam-tracker",
  "condition": {}
}
```

- [ ] **Step 6: Create sitemap.json**

```json
{
  "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html",
  "rules": [
    {
      "action": "allow",
      "page": "*"
    }
  ]
}
```

- [ ] **Step 7: Verify project opens in WeChat Developer Tools**

Open WeChat Developer Tools → Import Project → Select `exam-tracker` folder. Verify the empty app loads without errors.

---

### Task 2: Preset Exam Data

**Files:**
- Create: `exam-tracker/data/preset-exams.js`

- [ ] **Step 1: Create preset exam catalog**

```javascript
// data/preset-exams.js
const presetExams = [
  // 计算机类
  {
    id: 'preset_001',
    name: '软件设计师（中级）',
    category: '计算机',
    examMonths: [5, 11],
    officialUrl: 'https://www.ruankao.org.cn',
    description: '全国计算机技术与软件专业技术资格（水平）考试'
  },
  {
    id: 'preset_002',
    name: '软件评测师（中级）',
    category: '计算机',
    examMonths: [5, 11],
    officialUrl: 'https://www.ruankao.org.cn',
    description: '全国计算机技术与软件专业技术资格（水平）考试'
  },
  {
    id: 'preset_003',
    name: '网络工程师（中级）',
    category: '计算机',
    examMonths: [5, 11],
    officialUrl: 'https://www.ruankao.org.cn',
    description: '全国计算机技术与软件专业技术资格（水平）考试'
  },
  {
    id: 'preset_004',
    name: '数据库系统工程师（中级）',
    category: '计算机',
    examMonths: [5, 11],
    officialUrl: 'https://www.ruankao.org.cn',
    description: '全国计算机技术与软件专业技术资格（水平）考试'
  },
  {
    id: 'preset_005',
    name: '信息系统项目管理师（高级）',
    category: '计算机',
    examMonths: [5, 11],
    officialUrl: 'https://www.ruankao.org.cn',
    description: '全国计算机技术与软件专业技术资格（水平）考试'
  },
  {
    id: 'preset_006',
    name: '系统架构设计师（高级）',
    category: '计算机',
    examMonths: [11],
    officialUrl: 'https://www.ruankao.org.cn',
    description: '全国计算机技术与软件专业技术资格（水平）考试'
  },

  // 法律类
  {
    id: 'preset_010',
    name: '法律职业资格考试',
    category: '法律',
    examMonths: [9, 10],
    officialUrl: 'https://www.moj.gov.cn',
    description: '国家统一法律职业资格考试（原司法考试）'
  },

  // 财会类
  {
    id: 'preset_020',
    name: '注册会计师（CPA）',
    category: '财会',
    examMonths: [8],
    officialUrl: 'https://www.cicpa.org.cn',
    description: '注册会计师全国统一考试'
  },
  {
    id: 'preset_021',
    name: '初级会计职称',
    category: '财会',
    examMonths: [5],
    officialUrl: 'https://www.mof.gov.cn',
    description: '全国会计专业技术初级资格考试'
  },
  {
    id: 'preset_022',
    name: '中级会计职称',
    category: '财会',
    examMonths: [9],
    officialUrl: 'https://www.mof.gov.cn',
    description: '全国会计专业技术中级资格考试'
  },
  {
    id: 'preset_023',
    name: '税务师',
    category: '财会',
    examMonths: [11],
    officialUrl: 'https://www.ctaa.org.cn',
    description: '全国税务师职业资格考试'
  },

  // 建筑类
  {
    id: 'preset_030',
    name: '一级建造师',
    category: '建筑',
    examMonths: [9, 11],
    officialUrl: 'https://www.mohurd.gov.cn',
    description: '全国一级建造师执业资格考试'
  },
  {
    id: 'preset_031',
    name: '二级建造师',
    category: '建筑',
    examMonths: [5, 6],
    officialUrl: 'https://www.mohurd.gov.cn',
    description: '全国二级建造师执业资格考试'
  },
  {
    id: 'preset_032',
    name: '一级造价工程师',
    category: '建筑',
    examMonths: [10, 11],
    officialUrl: 'https://www.mohurd.gov.cn',
    description: '全国一级造价工程师执业资格考试'
  },
  {
    id: 'preset_033',
    name: '注册消防工程师',
    category: '建筑',
    examMonths: [11],
    officialUrl: 'https://www.119.gov.cn',
    description: '全国注册消防工程师资格考试'
  },

  // 教师资格
  {
    id: 'preset_040',
    name: '教师资格证（笔试）',
    category: '教资',
    examMonths: [3, 9, 10, 12],
    officialUrl: 'https://ntce.neea.edu.cn',
    description: '中小学教师资格考试'
  },
  {
    id: 'preset_041',
    name: '教师资格证（面试）',
    category: '教资',
    examMonths: [1, 5],
    officialUrl: 'https://ntce.neea.edu.cn',
    description: '中小学教师资格考试'
  },

  // 医学类
  {
    id: 'preset_050',
    name: '执业医师',
    category: '医学',
    examMonths: [6, 8],
    officialUrl: 'https://www.nmec.org.cn',
    description: '国家医师资格考试'
  },
  {
    id: 'preset_051',
    name: '执业护士',
    category: '医学',
    examMonths: [4],
    officialUrl: 'https://www.chinarsk.org',
    description: '全国护士执业资格考试'
  },
  {
    id: 'preset_052',
    name: '执业药师',
    category: '医学',
    examMonths: [10, 11],
    officialUrl: 'https://www.cpa.org.cn',
    description: '全国执业药师职业资格考试'
  },

  // 语言类
  {
    id: 'preset_060',
    name: '大学英语四级（CET4）',
    category: '语言',
    examMonths: [6, 12],
    officialUrl: 'https://cet.neea.edu.cn',
    description: '全国大学英语四级考试'
  },
  {
    id: 'preset_061',
    name: '大学英语六级（CET6）',
    category: '语言',
    examMonths: [6, 12],
    officialUrl: 'https://cet.neea.edu.cn',
    description: '全国大学英语六级考试'
  },
  {
    id: 'preset_062',
    name: '雅思（IELTS）',
    category: '语言',
    examMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    officialUrl: 'https://www.chinaielts.org',
    description: '国际英语语言测试系统'
  },
  {
    id: 'preset_063',
    name: '托福（TOEFL）',
    category: '语言',
    examMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    officialUrl: 'https://toefl.neea.edu.cn',
    description: '托福考试'
  },
  {
    id: 'preset_064',
    name: '日语能力测试（JLPT）',
    category: '语言',
    examMonths: [7, 12],
    officialUrl: 'https://www.jlpt.jp',
    description: '日本语能力测试'
  },

  // 公务员
  {
    id: 'preset_070',
    name: '国家公务员考试（国考）',
    category: '公务员',
    examMonths: [11, 12],
    officialUrl: 'http://www.scs.gov.cn',
    description: '中央机关及其直属机构考试录用公务员'
  },
  {
    id: 'preset_071',
    name: '省公务员考试（省考）',
    category: '公务员',
    examMonths: [3, 4, 12],
    officialUrl: '',
    description: '各省公务员录用考试'
  },

  // 其他
  {
    id: 'preset_080',
    name: 'PMP项目管理',
    category: '其他',
    examMonths: [3, 6, 9, 12],
    officialUrl: 'https://www.pmichina.org',
    description: '项目管理专业人士资格认证'
  },
  {
    id: 'preset_081',
    name: '人力资源管理师',
    category: '其他',
    examMonths: [5, 11],
    officialUrl: 'http://www.mohrss.gov.cn',
    description: '企业人力资源管理师职业资格考试'
  },
  {
    id: 'preset_082',
    name: '心理咨询师',
    category: '其他',
    examMonths: [5, 11],
    officialUrl: 'http://www.mohrss.gov.cn',
    description: '心理咨询师职业资格考试'
  }
]

// 获取所有类别
function getCategories() {
  const categories = [...new Set(presetExams.map(e => e.category))]
  return categories
}

// 按类别分组
function groupByCategory(exams) {
  const groups = {}
  exams.forEach(exam => {
    if (!groups[exam.category]) {
      groups[exam.category] = []
    }
    groups[exam.category].push(exam)
  })
  return groups
}

// 搜索预设考试
function searchPresetExams(keyword) {
  if (!keyword) return presetExams
  const lower = keyword.toLowerCase()
  return presetExams.filter(e =>
    e.name.toLowerCase().includes(lower) ||
    e.category.toLowerCase().includes(lower) ||
    e.description.toLowerCase().includes(lower)
  )
}

// 根据 ID 获取
function getPresetExamById(id) {
  return presetExams.find(e => e.id === id) || null
}

module.exports = {
  presetExams,
  getCategories,
  groupByCategory,
  searchPresetExams,
  getPresetExamById
}
```

- [ ] **Step 2: Verify data loads correctly**

In WeChat Developer Tools console, run:
```javascript
const data = require('./data/preset-exams')
console.log(data.presetExams.length) // Should be ~30
console.log(data.getCategories())    // Should show category list
```

---

### Task 3: Date Utilities

**Files:**
- Create: `exam-tracker/utils/date.js`

- [ ] **Step 1: Create date utility functions**

```javascript
// utils/date.js

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format date as YYYY年MM月
 */
function formatMonth(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

/**
 * Calculate days remaining until target date
 * Returns positive number for future dates, negative for past
 */
function getDaysRemaining(targetDate) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Calculate months remaining (approximate)
 */
function getMonthsRemaining(targetDate) {
  const now = new Date()
  const target = new Date(targetDate)
  const yearDiff = target.getFullYear() - now.getFullYear()
  const monthDiff = target.getMonth() - now.getMonth()
  return yearDiff * 12 + monthDiff
}

/**
 * Generate a unique ID
 */
function generateId() {
  return 'exam_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * Get current ISO timestamp
 */
function nowISO() {
  return new Date().toISOString()
}

module.exports = {
  formatDate,
  formatMonth,
  getDaysRemaining,
  getMonthsRemaining,
  generateId,
  nowISO
}
```

---

### Task 4: Status Utilities

**Files:**
- Create: `exam-tracker/utils/status.js`

- [ ] **Step 1: Create status calculation utility**

```javascript
// utils/status.js
const { getDaysRemaining } = require('./date')

/**
 * Status priority (highest first):
 * 1. examSoon (red)    - exam within 7 days
 * 2. deadlineSoon (yellow) - registration deadline within 7 days
 * 3. registering (green) - registration open
 * 4. closed (gray)     - registration closed, exam > 7 days away
 */

const STATUS = {
  EXAM_SOON: {
    key: 'examSoon',
    label: '考试临近',
    color: '#FF4D4F',
    priority: 1
  },
  DEADLINE_SOON: {
    key: 'deadlineSoon',
    label: '即将截止',
    color: '#FAAD14',
    priority: 2
  },
  REGISTERING: {
    key: 'registering',
    label: '报名中',
    color: '#52C41A',
    priority: 3
  },
  CLOSED: {
    key: 'closed',
    label: '已截止',
    color: '#999999',
    priority: 4
  }
}

/**
 * Calculate exam status based on dates
 * @param {string} examDate - exam date (YYYY-MM-DD)
 * @param {string|null} registrationDeadline - registration deadline (YYYY-MM-DD)
 * @returns {object} status object with key, label, color
 */
function getExamStatus(examDate, registrationDeadline) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const exam = new Date(examDate)
  exam.setHours(0, 0, 0, 0)

  const daysToExam = getDaysRemaining(examDate)

  // Priority 1: exam soon (within 7 days)
  if (daysToExam >= 0 && daysToExam <= 7) {
    return STATUS.EXAM_SOON
  }

  // If no deadline, default to registering if exam is in future
  if (!registrationDeadline) {
    return daysToExam > 0 ? STATUS.REGISTERING : STATUS.CLOSED
  }

  const deadline = new Date(registrationDeadline)
  deadline.setHours(0, 0, 0, 0)
  const daysToDeadline = getDaysRemaining(registrationDeadline)

  // Priority 2: deadline soon (within 7 days and not passed)
  if (daysToDeadline >= 0 && daysToDeadline <= 7) {
    return STATUS.DEADLINE_SOON
  }

  // Priority 3: registering (deadline not passed)
  if (now < deadline) {
    return STATUS.REGISTERING
  }

  // Priority 4: closed
  return STATUS.CLOSED
}

/**
 * Get countdown text for display
 */
function getCountdownText(exam) {
  if (exam.examDateType === 'approximate') {
    const months = getMonthsRemaining(exam.examDate)
    if (months <= 0) return '本月考试'
    return `预计还有约 ${months} 个月`
  }

  const days = getDaysRemaining(exam.examDate)
  if (days < 0) return '考试已结束'
  if (days === 0) return '今天考试'
  return `距离考试还有 ${days} 天`
}

module.exports = {
  STATUS,
  getExamStatus,
  getCountdownText
}
```

---

### Task 5: Storage Abstraction Layer

**Files:**
- Create: `exam-tracker/utils/storage.js`
- Create: `exam-tracker/utils/local-storage.js`

- [ ] **Step 1: Create storage interface**

```javascript
// utils/storage.js
// Storage abstraction - swap implementation for backend migration

const localStorage = require('./local-storage')

// MVP: use local storage
// Future: swap to apiStorage.js for backend
const storage = localStorage

module.exports = storage
```

- [ ] **Step 2: Create local storage implementation**

```javascript
// utils/local-storage.js
const EXAMS_KEY = 'user_exams'

/**
 * Get all exams from local storage
 */
function getExams() {
  try {
    const data = wx.getStorageSync(EXAMS_KEY)
    return data || []
  } catch (e) {
    console.error('Failed to get exams:', e)
    return []
  }
}

/**
 * Save all exams to local storage
 */
function saveExams(exams) {
  try {
    wx.setStorageSync(EXAMS_KEY, exams)
  } catch (e) {
    console.error('Failed to save exams:', e)
  }
}

/**
 * Get single exam by ID
 */
function getExamById(id) {
  const exams = getExams()
  return exams.find(e => e.id === id) || null
}

/**
 * Add a new exam
 */
function addExam(exam) {
  const exams = getExams()
  exams.push(exam)
  saveExams(exams)
  return exam
}

/**
 * Update an existing exam
 */
function updateExam(id, data) {
  const exams = getExams()
  const index = exams.findIndex(e => e.id === id)
  if (index === -1) return null
  exams[index] = { ...exams[index], ...data, updatedAt: new Date().toISOString() }
  saveExams(exams)
  return exams[index]
}

/**
 * Delete an exam
 */
function deleteExam(id) {
  const exams = getExams()
  const filtered = exams.filter(e => e.id !== id)
  saveExams(filtered)
  return filtered.length < exams.length
}

/**
 * Search exams by keyword
 */
function searchExams(keyword) {
  if (!keyword) return getExams()
  const lower = keyword.toLowerCase()
  const exams = getExams()
  return exams.filter(e =>
    e.name.toLowerCase().includes(lower) ||
    (e.region && e.region.toLowerCase().includes(lower))
  )
}

module.exports = {
  getExams,
  getExamById,
  addExam,
  updateExam,
  deleteExam,
  searchExams
}
```

---

### Task 6: Exam Card Component

**Files:**
- Create: `exam-tracker/components/exam-card/exam-card.js`
- Create: `exam-tracker/components/exam-card/exam-card.json`
- Create: `exam-tracker/components/exam-card/exam-card.wxml`
- Create: `exam-tracker/components/exam-card/exam-card.wxss`

- [ ] **Step 1: Create exam-card component JS**

```javascript
// components/exam-card/exam-card.js
const { formatDate, formatMonth } = require('../../utils/date')
const { getExamStatus, getCountdownText } = require('../../utils/status')

Component({
  properties: {
    exam: {
      type: Object,
      value: {}
    }
  },

  data: {
    status: {},
    countdownText: '',
    dateDisplay: ''
  },

  observers: {
    'exam': function(exam) {
      if (!exam || !exam.id) return
      const status = getExamStatus(exam.examDate, exam.registrationDeadline)
      const countdownText = getCountdownText(exam)
      const dateDisplay = exam.examDateType === 'approximate'
        ? formatMonth(exam.examDate) + '（预计）'
        : formatDate(exam.examDate)
      this.setData({ status, countdownText, dateDisplay })
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { exam: this.data.exam })
    },

    onDelete() {
      wx.showModal({
        title: '确认删除',
        content: `确定要删除「${this.data.exam.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('delete', { id: this.data.exam.id })
          }
        }
      })
    }
  }
})
```

- [ ] **Step 2: Create exam-card component JSON**

```json
{
  "component": true,
  "usingComponents": {}
}
```

- [ ] **Step 3: Create exam-card component WXML**

```xml
<view class="exam-card" bindtap="onTap">
  <view class="card-header">
    <text class="exam-name">{{exam.name}}</text>
    <view class="status-tag" style="background-color: {{status.color}}">
      {{status.label}}
    </view>
  </view>

  <view class="card-body">
    <view class="info-row">
      <text class="info-label">考试时间：</text>
      <text class="info-value">{{dateDisplay}}</text>
    </view>
    <view class="countdown-row">
      <text class="countdown-text">{{countdownText}}</text>
    </view>
    <view class="info-row" wx:if="{{exam.region}}">
      <text class="info-label">地区：</text>
      <text class="info-value">{{exam.region}}</text>
    </view>
  </view>

  <view class="card-footer">
    <view class="btn-delete" catchtap="onDelete">
      <text>删除</text>
    </view>
  </view>
</view>
```

- [ ] **Step 4: Create exam-card component WXSS**

```css
.exam-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.exam-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  margin-right: 16rpx;
}

.status-tag {
  font-size: 22rpx;
  color: #fff;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  white-space: nowrap;
}

.card-body {
  margin-bottom: 16rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.info-label {
  font-size: 26rpx;
  color: #999;
  width: 150rpx;
}

.info-value {
  font-size: 26rpx;
  color: #666;
}

.countdown-row {
  margin: 16rpx 0;
}

.countdown-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #1890FF;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 16rpx;
}

.btn-delete {
  font-size: 24rpx;
  color: #999;
  padding: 8rpx 20rpx;
}

.btn-delete:active {
  color: #FF4D4F;
}
```

---

### Task 7: Index Page (Home - Exam List)

**Files:**
- Create: `exam-tracker/pages/index/index.js`
- Create: `exam-tracker/pages/index/index.json`
- Create: `exam-tracker/pages/index/index.wxml`
- Create: `exam-tracker/pages/index/index.wxss`

- [ ] **Step 1: Create index page JSON**

```json
{
  "usingComponents": {
    "exam-card": "/components/exam-card/exam-card"
  },
  "navigationBarTitleText": "考证倒计时"
}
```

- [ ] **Step 2: Create index page JS**

```javascript
// pages/index/index.js
const storage = require('../../utils/storage')
const { getExamStatus } = require('../../utils/status')

Page({
  data: {
    exams: [],
    filteredExams: [],
    currentFilter: 'all',
    filters: [
      { key: 'all', label: '全部' },
      { key: 'registering', label: '报名中' },
      { key: 'examSoon', label: '考试临近' }
    ],
    isEmpty: true
  },

  onShow() {
    this.loadExams()
  },

  loadExams() {
    const exams = storage.getExams()
    // Sort by exam date (nearest first)
    exams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
    this.setData({
      exams,
      isEmpty: exams.length === 0
    })
    this.applyFilter()
  },

  applyFilter() {
    const { exams, currentFilter } = this.data
    let filtered = exams

    if (currentFilter === 'registering') {
      filtered = exams.filter(e => {
        const status = getExamStatus(e.examDate, e.registrationDeadline)
        return status.key === 'registering' || status.key === 'deadlineSoon'
      })
    } else if (currentFilter === 'examSoon') {
      filtered = exams.filter(e => {
        const status = getExamStatus(e.examDate, e.registrationDeadline)
        return status.key === 'examSoon'
      })
    }

    this.setData({ filteredExams: filtered })
  },

  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.applyFilter()
  },

  onExamTap(e) {
    const { exam } = e.detail
    wx.navigateTo({
      url: `/pages/edit/edit?id=${exam.id}`
    })
  },

  onExamDelete(e) {
    const { id } = e.detail
    storage.deleteExam(id)
    this.loadExams()
    wx.showToast({ title: '已删除', icon: 'success' })
  },

  onAddExam() {
    wx.navigateTo({
      url: '/pages/add/add'
    })
  }
})
```

- [ ] **Step 3: Create index page WXML**

```xml
<view class="container">
  <!-- Filter tabs -->
  <view class="filter-bar">
    <view
      wx:for="{{filters}}"
      wx:key="key"
      class="filter-tab {{currentFilter === item.key ? 'active' : ''}}"
      bindtap="onFilterChange"
      data-filter="{{item.key}}"
    >
      {{item.label}}
    </view>
  </view>

  <!-- Exam list -->
  <view class="exam-list" wx:if="{{!isEmpty}}">
    <exam-card
      wx:for="{{filteredExams}}"
      wx:key="id"
      exam="{{item}}"
      bind:tap="onExamTap"
      bind:delete="onExamDelete"
    />
  </view>

  <!-- Empty state -->
  <view class="empty-state" wx:if="{{isEmpty}}">
    <image class="empty-icon" src="/assets/empty.png" mode="aspectFit" />
    <text class="empty-text">还没有添加考试</text>
    <text class="empty-hint">点击下方按钮添加你的第一个考试</text>
  </view>

  <!-- Add button -->
  <view class="fab-button" bindtap="onAddExam">
    <text class="fab-icon">+</text>
  </view>
</view>
```

- [ ] **Step 4: Create index page WXSS**

```css
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

/* Filter bar */
.filter-bar {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.filter-tab.active {
  background-color: #1890FF;
  color: #fff;
  font-weight: 500;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #ccc;
}

/* FAB button */
.fab-button {
  position: fixed;
  right: 40rpx;
  bottom: 80rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #1890FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(24, 144, 255, 0.4);
  z-index: 100;
}

.fab-button:active {
  transform: scale(0.95);
}

.fab-icon {
  font-size: 52rpx;
  color: #fff;
  font-weight: 300;
  line-height: 1;
}
```

- [ ] **Step 5: Create empty state placeholder image**

Create a simple empty state icon. For MVP, use a text-based placeholder or download a free icon to `exam-tracker/assets/empty.png`.

---

### Task 8: Add Page (Search Preset / Custom)

**Files:**
- Create: `exam-tracker/pages/add/add.js`
- Create: `exam-tracker/pages/add/add.json`
- Create: `exam-tracker/pages/add/add.wxml`
- Create: `exam-tracker/pages/add/add.wxss`

- [ ] **Step 1: Create add page JSON**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "添加考试"
}
```

- [ ] **Step 2: Create add page JS**

```javascript
// pages/add/add.js
const { searchPresetExams, groupByCategory, presetExams } = require('../../data/preset-exams')

Page({
  data: {
    keyword: '',
    searchResults: [],
    groupedExams: {},
    isSearching: false,
    showResults: false
  },

  onLoad() {
    // Show all grouped by default
    const groupedExams = groupByCategory(presetExams)
    this.setData({ groupedExams })
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ keyword })

    if (!keyword) {
      this.setData({
        searchResults: [],
        showResults: false,
        groupedExams: groupByCategory(presetExams)
      })
      return
    }

    const results = searchPresetExams(keyword)
    this.setData({
      searchResults: results,
      showResults: true,
      groupedExams: results.length > 0 ? {} : {}
    })
  },

  onSelectPreset(e) {
    const preset = e.currentTarget.dataset.preset
    wx.navigateTo({
      url: `/pages/edit/edit?presetId=${preset.id}&name=${encodeURIComponent(preset.name)}&examMonths=${JSON.stringify(preset.examMonths)}`
    })
  },

  onCustomAdd() {
    wx.navigateTo({
      url: '/pages/edit/edit'
    })
  }
})
```

- [ ] **Step 3: Create add page WXML**

```xml
<view class="container">
  <!-- Search bar -->
  <view class="search-bar">
    <input
      class="search-input"
      placeholder="搜索考试名称，如：软考、司法、CPA..."
      value="{{keyword}}"
      bindinput="onSearchInput"
      focus="true"
    />
  </view>

  <!-- Search results -->
  <view class="search-results" wx:if="{{showResults}}">
    <view class="section-title" wx:if="{{searchResults.length > 0}}">
      搜索结果（{{searchResults.length}}）
    </view>
    <view class="preset-list">
      <view
        class="preset-item"
        wx:for="{{searchResults}}"
        wx:key="id"
        bindtap="onSelectPreset"
        data-preset="{{item}}"
      >
        <view class="preset-info">
          <text class="preset-name">{{item.name}}</text>
          <text class="preset-category">{{item.category}}</text>
        </view>
        <view class="preset-months">
          <text class="months-label">通常考试月份：</text>
          <text class="months-value">{{item.examMonths.join('、')}}月</text>
        </view>
      </view>
    </view>
    <view class="no-results" wx:if="{{searchResults.length === 0 && keyword}}">
      <text>没有找到相关考试</text>
    </view>
  </view>

  <!-- Grouped list (when not searching) -->
  <view class="grouped-list" wx:if="{{!showResults}}">
    <block wx:for="{{groupedExams}}" wx:for-index="category" wx:for-list="exams" wx:key="category">
      <view class="category-group">
        <view class="category-title">{{category}}</view>
        <view class="preset-list">
          <view
            class="preset-item"
            wx:for="{{groupedExams[category]}}"
            wx:for-item="exam"
            wx:key="id"
            bindtap="onSelectPreset"
            data-preset="{{exam}}"
          >
            <view class="preset-info">
              <text class="preset-name">{{exam.name}}</text>
            </view>
            <view class="preset-months">
              <text class="months-label">通常考试月份：</text>
              <text class="months-value">{{exam.examMonths.join('、')}}月</text>
            </view>
          </view>
        </view>
      </view>
    </block>
  </view>

  <!-- Custom add button -->
  <view class="custom-add-section">
    <view class="divider">
      <view class="divider-line"></view>
      <text class="divider-text">或者</text>
      <view class="divider-line"></view>
    </view>
    <button class="custom-add-btn" bindtap="onCustomAdd">
      没有找到？自定义添加
    </button>
  </view>
</view>
```

- [ ] **Step 4: Create add page WXSS**

```css
.container {
  padding: 20rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

/* Search bar */
.search-bar {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.search-input {
  font-size: 30rpx;
  width: 100%;
}

/* Section title */
.section-title {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

/* Category group */
.category-group {
  margin-bottom: 30rpx;
}

.category-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1890FF;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

/* Preset list */
.preset-list {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.preset-item {
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background-color 0.2s;
}

.preset-item:last-child {
  border-bottom: none;
}

.preset-item:active {
  background-color: #f0f7ff;
}

.preset-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.preset-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.preset-category {
  font-size: 22rpx;
  color: #1890FF;
  background-color: #e6f7ff;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.preset-months {
  display: flex;
  align-items: center;
}

.months-label {
  font-size: 24rpx;
  color: #999;
}

.months-value {
  font-size: 24rpx;
  color: #666;
}

/* No results */
.no-results {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* Custom add section */
.custom-add-section {
  margin-top: 40rpx;
  padding-bottom: 40rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background-color: #e8e8e8;
}

.divider-text {
  padding: 0 20rpx;
  font-size: 26rpx;
  color: #999;
}

.custom-add-btn {
  background-color: #fff;
  color: #1890FF;
  border: 2rpx solid #1890FF;
  border-radius: 16rpx;
  font-size: 30rpx;
  padding: 24rpx;
}

.custom-add-btn:active {
  background-color: #f0f7ff;
}
```

---

### Task 9: Edit Page (Exam Form)

**Files:**
- Create: `exam-tracker/pages/edit/edit.js`
- Create: `exam-tracker/pages/edit/edit.json`
- Create: `exam-tracker/pages/edit/edit.wxml`
- Create: `exam-tracker/pages/edit/edit.wxss`

- [ ] **Step 1: Create edit page JSON**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "编辑考试"
}
```

- [ ] **Step 2: Create edit page JS**

```javascript
// pages/edit/edit.js
const storage = require('../../utils/storage')
const { generateId, nowISO } = require('../../utils/date')

Page({
  data: {
    isEdit: false,
    examId: '',
    presetId: null,
    name: '',
    examDateType: 'exact', // 'exact' | 'approximate'
    examDate: '',
    examMonth: '',
    registrationDeadline: '',
    region: '',
    // Date picker constraints
    minDate: '',
    maxDate: '',
    // Preset info
    presetMonths: []
  },

  onLoad(options) {
    const now = new Date()
    const minDate = `${now.getFullYear()}-01-01`
    const maxDate = `${now.getFullYear() + 2}-12-31`

    if (options.id) {
      // Edit existing exam
      this.loadExam(options.id)
      this.setData({ isEdit: true, examId: options.id, minDate, maxDate })
      wx.setNavigationBarTitle({ title: '编辑考试' })
    } else if (options.presetId) {
      // From preset selection
      const name = decodeURIComponent(options.name || '')
      const examMonths = JSON.parse(options.examMonths || '[]')
      this.setData({
        presetId: options.presetId,
        name,
        presetMonths: examMonths,
        minDate,
        maxDate
      })
      wx.setNavigationBarTitle({ title: '添加考试' })
    } else {
      // Custom add
      this.setData({ minDate, maxDate })
      wx.setNavigationBarTitle({ title: '自定义添加' })
    }
  },

  loadExam(id) {
    const exam = storage.getExamById(id)
    if (!exam) {
      wx.showToast({ title: '考试不存在', icon: 'error' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    let examMonth = ''
    if (exam.examDateType === 'approximate') {
      const d = new Date(exam.examDate)
      examMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    }

    this.setData({
      presetId: exam.presetId,
      name: exam.name,
      examDateType: exam.examDateType,
      examDate: exam.examDateType === 'exact' ? exam.examDate : '',
      examMonth,
      registrationDeadline: exam.registrationDeadline || '',
      region: exam.region || ''
    })
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onDateTypeChange(e) {
    const type = e.detail.value ? 'approximate' : 'exact'
    this.setData({
      examDateType: type,
      examDate: '',
      examMonth: ''
    })
  },

  onExamDateChange(e) {
    this.setData({ examDate: e.detail.value })
  },

  onExamMonthChange(e) {
    this.setData({ examMonth: e.detail.value })
  },

  onDeadlineChange(e) {
    this.setData({ registrationDeadline: e.detail.value })
  },

  onRegionInput(e) {
    this.setData({ region: e.detail.value })
  },

  onClearDeadline() {
    this.setData({ registrationDeadline: '' })
  },

  onSave() {
    const { name, examDateType, examDate, examMonth, registrationDeadline, region } = this.data

    // Validation
    if (!name.trim()) {
      wx.showToast({ title: '请输入考试名称', icon: 'none' })
      return
    }

    let finalExamDate = ''
    if (examDateType === 'exact') {
      if (!examDate) {
        wx.showToast({ title: '请选择考试日期', icon: 'none' })
        return
      }
      finalExamDate = examDate
    } else {
      if (!examMonth) {
        wx.showToast({ title: '请选择考试月份', icon: 'none' })
        return
      }
      // Store as first day of month
      finalExamDate = examMonth + '-01'
    }

    const now = nowISO()
    const examData = {
      presetId: this.data.presetId,
      name: name.trim(),
      examDate: finalExamDate,
      examDateType,
      registrationDeadline: registrationDeadline || null,
      region: region.trim() || null,
      source: 'manual',
      sourceUrl: null,
      lastSyncAt: null,
      updatedAt: now
    }

    if (this.data.isEdit) {
      storage.updateExam(this.data.examId, examData)
      wx.showToast({ title: '已更新', icon: 'success' })
    } else {
      examData.id = generateId()
      examData.createdAt = now
      storage.addExam(examData)
      wx.showToast({ title: '已添加', icon: 'success' })
    }

    setTimeout(() => wx.navigateBack(), 1500)
  }
})
```

- [ ] **Step 3: Create edit page WXML**

```xml
<view class="container">
  <view class="form-card">
    <!-- Exam name -->
    <view class="form-item">
      <text class="form-label">考试名称</text>
      <input
        class="form-input"
        placeholder="请输入考试名称"
        value="{{name}}"
        bindinput="onNameInput"
      />
    </view>

    <!-- Date type toggle -->
    <view class="form-item">
      <text class="form-label">考试日期类型</text>
      <view class="toggle-row">
        <text class="toggle-label">大致月份</text>
        <switch
          checked="{{examDateType === 'approximate'}}"
          bindchange="onDateTypeChange"
          color="#1890FF"
        />
      </view>
    </view>

    <!-- Exact date picker -->
    <view class="form-item" wx:if="{{examDateType === 'exact'}}">
      <text class="form-label">考试日期</text>
      <picker
        mode="date"
        value="{{examDate}}"
        start="{{minDate}}"
        end="{{maxDate}}"
        bindchange="onExamDateChange"
      >
        <view class="picker-value {{examDate ? '' : 'placeholder'}}">
          {{examDate || '请选择日期'}}
        </view>
      </picker>
    </view>

    <!-- Approximate month picker -->
    <view class="form-item" wx:if="{{examDateType === 'approximate'}}">
      <text class="form-label">考试月份</text>
      <picker
        mode="date"
        value="{{examMonth}}"
        fields="month"
        start="{{minDate}}"
        end="{{maxDate}}"
        bindchange="onExamMonthChange"
      >
        <view class="picker-value {{examMonth ? '' : 'placeholder'}}">
          {{examMonth || '请选择月份'}}
        </view>
      </picker>
      <view class="form-hint" wx:if="{{presetMonths.length > 0}}">
        参考月份：{{presetMonths.join('、')}}月
      </view>
    </view>

    <!-- Registration deadline -->
    <view class="form-item">
      <view class="label-row">
        <text class="form-label">报名截止日期</text>
        <text class="clear-btn" wx:if="{{registrationDeadline}}" bindtap="onClearDeadline">清除</text>
      </view>
      <picker
        mode="date"
        value="{{registrationDeadline}}"
        start="{{minDate}}"
        end="{{maxDate}}"
        bindchange="onDeadlineChange"
      >
        <view class="picker-value {{registrationDeadline ? '' : 'placeholder'}}">
          {{registrationDeadline || '可留空'}}
        </view>
      </picker>
    </view>

    <!-- Region -->
    <view class="form-item">
      <text class="form-label">所在地区</text>
      <input
        class="form-input"
        placeholder="如：北京市、广东省"
        value="{{region}}"
        bindinput="onRegionInput"
      />
    </view>
  </view>

  <!-- Save button -->
  <button class="save-btn" bindtap="onSave">
    {{isEdit ? '保存修改' : '添加考试'}}
  </button>
</view>
```

- [ ] **Step 4: Create edit page WXSS**

```css
.container {
  padding: 20rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

.form-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 10rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.form-item {
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.form-input {
  font-size: 30rpx;
  width: 100%;
  padding: 8rpx 0;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-label {
  font-size: 28rpx;
  color: #666;
}

.picker-value {
  font-size: 30rpx;
  color: #333;
  padding: 8rpx 0;
}

.picker-value.placeholder {
  color: #ccc;
}

.form-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.clear-btn {
  font-size: 24rpx;
  color: #FF4D4F;
}

.save-btn {
  margin-top: 40rpx;
  background-color: #1890FF;
  color: #fff;
  border-radius: 16rpx;
  font-size: 32rpx;
  padding: 28rpx;
  border: none;
}

.save-btn:active {
  background-color: #096dd9;
}
```

---

### Task 10: Final Integration & Testing

- [ ] **Step 1: Test the complete flow in WeChat Developer Tools**

1. Open project in WeChat Developer Tools
2. Home page should show empty state
3. Click "+" button → Add page opens
4. Search for "软考" → Should show matching preset
5. Click preset → Edit page opens with name pre-filled
6. Fill in date, region → Save
7. Home page should show the exam card with countdown
8. Click exam card → Edit page opens for editing
9. Delete exam → Confirm → Exam removed
10. Test custom add flow (no preset selected)

- [ ] **Step 2: Test edge cases**

1. Add exam with approximate date → Should show "预计还有约 X 个月"
2. Add exam without registration deadline → Status should show "报名中" if exam is in future
3. Add exam with past date → Should show "已截止" or "考试已结束"
4. Add exam within 7 days → Should show "考试临近" (red)
5. Test filter tabs on home page

- [ ] **Step 3: Create initial git commit**

```bash
cd exam-tracker
git init
git add .
git commit -m "feat: initial exam tracker mini program with preset catalog and countdown"
```
