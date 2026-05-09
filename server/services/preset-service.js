const db = require('../db')

const presetExams = [
  { id: 'preset_001', name: '软件设计师（中级）', category: '计算机', examMonths: [5, 11], officialUrl: 'https://www.ruankao.org.cn', description: '全国计算机技术与软件专业技术资格（水平）考试' },
  { id: 'preset_002', name: '软件评测师（中级）', category: '计算机', examMonths: [5, 11], officialUrl: 'https://www.ruankao.org.cn', description: '全国计算机技术与软件专业技术资格（水平）考试' },
  { id: 'preset_003', name: '网络工程师（中级）', category: '计算机', examMonths: [5, 11], officialUrl: 'https://www.ruankao.org.cn', description: '全国计算机技术与软件专业技术资格（水平）考试' },
  { id: 'preset_004', name: '数据库系统工程师（中级）', category: '计算机', examMonths: [5, 11], officialUrl: 'https://www.ruankao.org.cn', description: '全国计算机技术与软件专业技术资格（水平）考试' },
  { id: 'preset_005', name: '信息系统项目管理师（高级）', category: '计算机', examMonths: [5, 11], officialUrl: 'https://www.ruankao.org.cn', description: '全国计算机技术与软件专业技术资格（水平）考试' },
  { id: 'preset_006', name: '系统架构设计师（高级）', category: '计算机', examMonths: [11], officialUrl: 'https://www.ruankao.org.cn', description: '全国计算机技术与软件专业技术资格（水平）考试' },
  { id: 'preset_010', name: '法律职业资格考试', category: '法律', examMonths: [9, 10], officialUrl: 'https://www.moj.gov.cn', description: '国家统一法律职业资格考试（原司法考试）' },
  { id: 'preset_020', name: '注册会计师（CPA）', category: '财会', examMonths: [8], officialUrl: 'https://www.cicpa.org.cn', description: '注册会计师全国统一考试' },
  { id: 'preset_021', name: '初级会计职称', category: '财会', examMonths: [5], officialUrl: 'https://www.mof.gov.cn', description: '全国会计专业技术初级资格考试' },
  { id: 'preset_022', name: '中级会计职称', category: '财会', examMonths: [9], officialUrl: 'https://www.mof.gov.cn', description: '全国会计专业技术中级资格考试' },
  { id: 'preset_023', name: '税务师', category: '财会', examMonths: [11], officialUrl: 'https://www.ctaa.org.cn', description: '全国税务师职业资格考试' },
  { id: 'preset_030', name: '一级建造师', category: '建筑', examMonths: [9, 11], officialUrl: 'https://www.mohurd.gov.cn', description: '全国一级建造师执业资格考试' },
  { id: 'preset_031', name: '二级建造师', category: '建筑', examMonths: [5, 6], officialUrl: 'https://www.mohurd.gov.cn', description: '全国二级建造师执业资格考试' },
  { id: 'preset_032', name: '一级造价工程师', category: '建筑', examMonths: [10, 11], officialUrl: 'https://www.mohurd.gov.cn', description: '全国一级造价工程师执业资格考试' },
  { id: 'preset_033', name: '注册消防工程师', category: '建筑', examMonths: [11], officialUrl: 'https://www.119.gov.cn', description: '全国注册消防工程师资格考试' },
  { id: 'preset_040', name: '教师资格证（笔试）', category: '教资', examMonths: [3, 9, 10, 12], officialUrl: 'https://ntce.neea.edu.cn', description: '中小学教师资格考试' },
  { id: 'preset_041', name: '教师资格证（面试）', category: '教资', examMonths: [1, 5], officialUrl: 'https://ntce.neea.edu.cn', description: '中小学教师资格考试' },
  { id: 'preset_050', name: '执业医师', category: '医学', examMonths: [6, 8], officialUrl: 'https://www.nmec.org.cn', description: '国家医师资格考试' },
  { id: 'preset_051', name: '执业护士', category: '医学', examMonths: [4], officialUrl: 'https://www.chinarsk.org', description: '全国护士执业资格考试' },
  { id: 'preset_052', name: '执业药师', category: '医学', examMonths: [10, 11], officialUrl: 'https://www.cpa.org.cn', description: '全国执业药师职业资格考试' },
  { id: 'preset_060', name: '大学英语四级（CET4）', category: '语言', examMonths: [6, 12], officialUrl: 'https://cet.neea.edu.cn', description: '全国大学英语四级考试' },
  { id: 'preset_061', name: '大学英语六级（CET6）', category: '语言', examMonths: [6, 12], officialUrl: 'https://cet.neea.edu.cn', description: '全国大学英语六级考试' },
  { id: 'preset_062', name: '雅思（IELTS）', category: '语言', examMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], officialUrl: 'https://www.chinaielts.org', description: '国际英语语言测试系统' },
  { id: 'preset_063', name: '托福（TOEFL）', category: '语言', examMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], officialUrl: 'https://toefl.neea.edu.cn', description: '托福考试' },
  { id: 'preset_064', name: '日语能力测试（JLPT）', category: '语言', examMonths: [7, 12], officialUrl: 'https://www.jlpt.jp', description: '日本语能力测试' },
  { id: 'preset_070', name: '国家公务员考试（国考）', category: '公务员', examMonths: [11, 12], officialUrl: 'http://www.scs.gov.cn', description: '中央机关及其直属机构考试录用公务员' },
  { id: 'preset_071', name: '省公务员考试（省考）', category: '公务员', examMonths: [3, 4, 12], officialUrl: '', description: '各省公务员录用考试' },
  { id: 'preset_080', name: 'PMP项目管理', category: '其他', examMonths: [3, 6, 9, 12], officialUrl: 'https://www.pmichina.org', description: '项目管理专业人士资格认证' },
  { id: 'preset_081', name: '人力资源管理师', category: '其他', examMonths: [5, 11], officialUrl: 'http://www.mohrss.gov.cn', description: '企业人力资源管理师职业资格考试' },
  { id: 'preset_082', name: '心理咨询师', category: '其他', examMonths: [5, 11], officialUrl: 'http://www.mohrss.gov.cn', description: '心理咨询师职业资格考试' }
]

function initPresetData() {
  const count = db.prepare('SELECT COUNT(*) as count FROM preset_exams').get().count
  if (count > 0) return

  console.log('Initializing preset exam data...')
  const insert = db.prepare(`
    INSERT OR IGNORE INTO preset_exams (id, name, category, exam_months, official_url, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((exams) => {
    for (const exam of exams) {
      insert.run(exam.id, exam.name, exam.category, JSON.stringify(exam.examMonths), exam.officialUrl, exam.description)
    }
  })

  insertMany(presetExams)
  console.log(`Inserted ${presetExams.length} preset exams`)
}

module.exports = { initPresetData }
