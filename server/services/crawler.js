const axios = require('axios')
const db = require('../db')

// Crawler sources configuration
const SOURCES = [
  {
    name: '中国人事考试网',
    url: 'http://www.cpta.com.cn',
    type: 'html',
    category: '综合'
  },
  {
    name: '软考官网',
    url: 'https://www.ruankao.org.cn',
    type: 'html',
    category: '计算机'
  }
]

// Crawl exam info from a source
async function crawlFromSource(source) {
  try {
    console.log(`Crawling from ${source.name}...`)
    const response = await axios.get(source.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    // Parse response based on source type
    const exams = parseExamData(response.data, source)
    return exams
  } catch (error) {
    console.error(`Crawl failed for ${source.name}:`, error.message)
    return []
  }
}

// Parse exam data from HTML
function parseExamData(html, source) {
  // Basic HTML parsing - in production, use cheerio or similar
  const exams = []

  // Look for common exam patterns in the HTML
  const datePatterns = [
    /(\d{4})年(\d{1,2})月(\d{1,2})日/g,
    /(\d{4})-(\d{1,2})-(\d{1,2})/g,
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/g
  ]

  const examKeywords = ['考试', '报名', '资格', '认证', '等级']

  // Simple extraction - look for lines containing exam keywords
  const lines = html.split('\n').filter(line => {
    return examKeywords.some(kw => line.includes(kw)) && line.length < 200
  })

  for (const line of lines.slice(0, 10)) {
    for (const pattern of datePatterns) {
      const match = pattern.exec(line)
      if (match) {
        const year = parseInt(match[1])
        const month = parseInt(match[2])
        const day = parseInt(match[3])

        if (year >= 2024 && year <= 2028 && month >= 1 && month <= 12) {
          exams.push({
            name: line.substring(0, 50).trim(),
            examDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            source: source.name,
            sourceUrl: source.url,
            category: source.category
          })
        }
      }
    }
  }

  return exams
}

// Save crawled exams to database
function saveCrawledExams(exams) {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO preset_exams (id, name, category, exam_months, official_url, description, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `)

  let savedCount = 0
  const saveMany = db.transaction((examList) => {
    for (const exam of examList) {
      const id = `crawled_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      const examMonths = [new Date(exam.examDate).getMonth() + 1]
      insert.run(id, exam.name, exam.category, JSON.stringify(examMonths), exam.sourceUrl || '', `来源: ${exam.source}`)
      savedCount++
    }
  })

  saveMany(exams)
  return savedCount
}

// Main crawl function - runs all sources
async function crawlAll() {
  console.log('Starting crawl job...')
  const allExams = []

  for (const source of SOURCES) {
    const exams = await crawlFromSource(source)
    allExams.push(...exams)
  }

  const savedCount = saveCrawledExams(allExams)
  console.log(`Crawl complete: ${allExams.length} found, ${savedCount} saved`)
  return { found: allExams.length, saved: savedCount }
}

module.exports = { crawlAll, crawlFromSource }
