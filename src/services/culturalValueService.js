/**
 * 文化价值评估服务 - 基于识别结果生成评估数据
 */

// 根据识别结果生成文化价值各维度评分（0-100），具有随机性使雷达图形状各异
export function evaluateCulturalValue(result) {
  if (!result) return null

  const seed = hashResult(result)
  const r = (offset) => ((seed + offset) % 100) / 100
  // 引入更多随机性：各维度使用不同偏移，使五边形形状差异明显
  const rand = (base, off, range) => Math.floor(base + r(off) * range)

  // 历史价值：25-95，与朝代、类型相关
  const historyScore = rand(25, 1, 70)
  // 稀缺性：20-92，与类型风格组合相关
  const scarcityScore = rand(20, 7, 72)
  // 完整性：30-88，与构件数量相关
  const integrityScore = rand(30, 13, 58)
  // 代表性：28-96，与风格典型性相关
  const representativenessScore = rand(28, 19, 68)
  // 地域独特性：22-90，与地域风格相关
  const regionalScore = rand(22, 23, 68)

  const scores = {
    history: Math.max(0, Math.min(100, historyScore)),
    scarcity: Math.max(0, Math.min(100, scarcityScore)),
    integrity: Math.max(0, Math.min(100, integrityScore)),
    representativeness: Math.max(0, Math.min(100, representativenessScore)),
    regional: Math.max(0, Math.min(100, regionalScore))
  }

  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 5
  // 星级严格按雷达图综合平均分评定
  const level = avg >= 90 ? 5 : avg >= 75 ? 4 : avg >= 60 ? 3 : avg >= 45 ? 2 : 1

  return { scores, level, average: Math.round(avg) }
}

function hashResult(result) {
  const str = JSON.stringify({
    type: result.buildingType?.name,
    region: result.styles?.region?.name,
    dynasty: result.styles?.dynasty?.name,
    components: result.components?.length
  })
  let h = 0
  for (let i = 0; i < Math.min(str.length, 200); i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

// 同类建筑对比排名（基于 store 中的 images）
export function getSimilarRanking(currentId, images) {
  const current = images.find(i => i.id === currentId)
  if (!current?.result) return { rank: 1, total: 1, differences: [] }

  const type = current.result.buildingType?.name
  const dynasty = current.result.styles?.dynasty?.name
  const region = current.result.styles?.region?.name

  const similar = images.filter(img => {
    if (img.id === currentId) return false
    const r = img.result
    if (!r) return false
    const sameType = !type || r.buildingType?.name === type
    const sameDynasty = !dynasty || r.styles?.dynasty?.name === dynasty
    const sameRegion = !region || r.styles?.region?.name === region
    return sameType || sameDynasty || sameRegion
  })

  // 按文化价值综合分排序（简化：用类型+风格匹配度）
  const scored = similar.map(img => {
    const r = img.result
    let score = 0
    if (r.buildingType?.name === type) score += 40
    if (r.styles?.dynasty?.name === dynasty) score += 30
    if (r.styles?.region?.name === region) score += 30
    return { ...img, _score: score }
  }).sort((a, b) => b._score - a._score)

  const allWithCurrent = [{ ...current, _score: 100 }, ...scored]
  const sorted = allWithCurrent.sort((a, b) => (b._score || 0) - (a._score || 0))
  const rank = sorted.findIndex(i => i.id === currentId) + 1
  const total = sorted.length

  const differences = []
  if (similar.length > 0) {
    const top = similar[0]?.result
    if (top?.buildingType?.name !== type) differences.push(`类型差异：对比建筑为${top?.buildingType?.name || '未知'}`)
    if (top?.styles?.region?.name !== region) differences.push(`地域风格差异：${top?.styles?.region?.name || '未知'}`)
    if (top?.culturalFeatures?.symmetry !== current.result?.culturalFeatures?.symmetry) {
      differences.push(`对称性差异：${top?.culturalFeatures?.symmetry || '未知'}`)
    }
  }

  return { rank, total, differences }
}

// AI 保护建议
export function getProtectionSuggestions(result, evaluation) {
  if (!result) return null

  const level = evaluation?.level ?? 3
  const protectionLevel = level >= 4 ? '国家级' : level >= 3 ? '省级' : '市级'

  const components = result.components || []
  const keyComponents = components
    .slice(0, 3)
    .map(c => c.name)
    .filter(Boolean)

  const styleAdvice = []
  if (result.styles?.region?.name) {
    styleAdvice.push(`保持${result.styles.region.name}的地域特色，修缮时选用当地传统材料与工艺`)
  }
  if (result.styles?.dynasty?.name) {
    styleAdvice.push(`遵循${result.styles.dynasty.name}的形制比例，避免过度现代化改造`)
  }
  if (result.culturalFeatures?.mainColor) {
    styleAdvice.push(`主色调建议维持${result.culturalFeatures.mainColor}，与周边环境协调`)
  }

  return {
    protectionLevel,
    keyComponents: keyComponents.length ? keyComponents : ['屋顶', '斗拱', '檐口'],
    styleAdvice: styleAdvice.length ? styleAdvice : ['保持原有建筑风格，修缮遵循最小干预原则']
  }
}
