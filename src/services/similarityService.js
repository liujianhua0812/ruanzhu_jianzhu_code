/**
 * 建筑风格相似性分析服务
 * 基于识别结果生成二维嵌入坐标与相似度
 */

const TYPE_IDS = { '宫殿建筑': 0, '宗教建筑': 1, '民居建筑': 2, '园林建筑': 3, '防御建筑': 4 }
const REGION_IDS = { '北方官式建筑': 0, '江南水乡建筑': 1, '闽南建筑': 2, '藏式建筑': 3 }
const DYNASTY_IDS = { '唐代风格': 0, '宋代风格': 1, '明代风格': 2, '清代风格': 3 }

function hash(str) {
  let h = 0
  for (let i = 0; i < (str || '').length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h = h & h
  }
  return Math.abs(h)
}

// 将建筑特征映射为二维嵌入坐标（模拟 t-SNE/UMAP 降维）
export function computeEmbedding(images) {
  const points = images.map((img, idx) => {
    const r = img.result
    if (!r) return { id: img.id, x: idx * 20, y: idx * 15, ...img }

    const type = r.buildingType?.name || ''
    const region = r.styles?.region?.name || ''
    const dynasty = r.styles?.dynasty?.name || ''
    const components = (r.components || []).map(c => c.name).join(',')

    const t = TYPE_IDS[type] ?? 2
    const rg = REGION_IDS[region] ?? 1
    const dy = DYNASTY_IDS[dynasty] ?? 2
    const compHash = hash(components) % 100 / 100

    const baseX = (t * 80 + rg * 30 + dy * 20) % 200 - 100
    const baseY = (t * 60 + rg * 40 + dy * 25) % 200 - 100
    const noise = (hash(img.id) % 50) - 25

    return {
      id: img.id,
      x: baseX + noise * 0.5 + compHash * 30,
      y: baseY + (hash(img.id + 'y') % 50 - 25) * 0.5,
      ...img
    }
  })
  return points
}

// 计算两栋建筑的相似度 (0-1)
function similarityScore(a, b) {
  const ra = a.result
  const rb = b.result
  if (!ra || !rb) return 0.3

  let score = 0
  if (ra.buildingType?.name === rb.buildingType?.name) score += 0.35
  if (ra.styles?.region?.name === rb.styles?.region?.name) score += 0.25
  if (ra.styles?.dynasty?.name === rb.styles?.dynasty?.name) score += 0.2

  const compA = new Set((ra.components || []).map(c => c.name))
  const compB = new Set((rb.components || []).map(c => c.name))
  const inter = [...compA].filter(x => compB.has(x)).length
  const union = new Set([...compA, ...compB]).size
  score += (union ? inter / union : 0) * 0.2

  return Math.min(1, score + 0.05)
}

// 获取 Top-N 相似建筑
export function getTopSimilar(selectedId, points, n = 5, filters = {}) {
  const selected = points.find(p => p.id === selectedId)
  if (!selected) return []

  let candidates = points.filter(p => p.id !== selectedId)

  if (filters.dynasty) {
    candidates = candidates.filter(p => p.result?.styles?.dynasty?.name === filters.dynasty)
  }
  if (filters.region) {
    candidates = candidates.filter(p => p.result?.styles?.region?.name === filters.region)
  }
  if (filters.type) {
    candidates = candidates.filter(p => p.result?.buildingType?.name === filters.type)
  }

  const scored = candidates.map(p => ({
    ...p,
    similarity: Math.round(similarityScore(selected, p) * 100),
    tags: getSimilarityTags(selected, p),
    explanation: getSimilarityExplanation(selected, p)
  }))

  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, n)
}

function getSimilarityTags(a, b) {
  const tags = []
  const ra = a.result
  const rb = b.result
  if (!ra || !rb) return tags

  const roofA = (ra.components || []).find(c => c.name?.includes('顶'))?.name
  const roofB = (rb.components || []).find(c => c.name?.includes('顶'))?.name
  if (roofA && roofB && roofA === roofB) tags.push('屋顶形式相同')

  const hasDougong = (r) => (r.components || []).some(c => c.name === '斗拱')
  if (hasDougong(ra) && hasDougong(rb)) tags.push('斗拱等级接近')

  if (ra.styles?.region?.name === rb.styles?.region?.name) tags.push('地域风格一致')
  if (ra.styles?.dynasty?.name === rb.styles?.dynasty?.name) tags.push('朝代风格一致')
  if (ra.buildingType?.name === rb.buildingType?.name) tags.push('建筑类型相同')

  return tags.slice(0, 3)
}

function getSimilarityExplanation(a, b) {
  const tags = getSimilarityTags(a, b)
  const ra = a.result
  const rb = b.result
  if (!ra || !rb) return '该建筑与目标建筑存在一定风格关联。'

  const parts = []
  if (tags.includes('屋顶形式相同')) parts.push('屋顶形式')
  if (tags.includes('斗拱等级接近')) parts.push('斗拱等级')
  if (tags.includes('地域风格一致')) parts.push('地域风格')
  if (tags.includes('朝代风格一致')) parts.push('朝代形制')
  if (tags.includes('建筑类型相同')) parts.push('建筑类型')

  const dynasty = ra.styles?.dynasty?.name || '传统'
  const region = ra.styles?.region?.name || '官式'
  const partStr = parts.length ? parts.join('、') : '整体风格'
  return `因${partStr}高度一致，该建筑与目标建筑在${dynasty}${region}风格空间中距离最小。`
}
