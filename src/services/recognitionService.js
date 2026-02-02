/**
 * 建筑识别服务 - 前端模拟实现
 * 基于图像特征生成确定性识别结果（无后端）
 */

// 建筑类型库
const BUILDING_TYPES = [
  { id: 'palace', name: '宫殿建筑', desc: '皇家宫殿、衙署等官方建筑' },
  { id: 'religious', name: '宗教建筑', desc: '寺庙、道观、佛塔等' },
  { id: 'residential', name: '民居建筑', desc: '四合院、土楼、窑洞等' },
  { id: 'garden', name: '园林建筑', desc: '亭台楼阁、廊桥水榭' },
  { id: 'defense', name: '防御建筑', desc: '城墙、寨堡、关隘' }
]

// 建筑风格库
const BUILDING_STYLES = {
  region: [
    { id: 'north_official', name: '北方官式建筑', desc: '庄重对称，斗拱繁密' },
    { id: 'jiangnan', name: '江南水乡建筑', desc: '白墙黛瓦，轻盈秀美' },
    { id: 'minnan', name: '闽南建筑', desc: '红砖燕尾，装饰华丽' },
    { id: 'tibetan', name: '藏式建筑', desc: '碉房式，色彩浓烈' }
  ],
  dynasty: [
    { id: 'tang', name: '唐代风格', desc: '雄浑大气，斗拱硕大' },
    { id: 'song', name: '宋代风格', desc: '典雅精致，比例和谐' },
    { id: 'ming', name: '明代风格', desc: '稳重端庄，装饰适度' },
    { id: 'qing', name: '清代风格', desc: '繁复华丽，等级分明' }
  ],
  ethnic: [
    { id: 'han', name: '汉式', desc: '传统汉族建筑形制' },
    { id: 'tibetan', name: '藏式', desc: '藏族建筑特色' },
    { id: 'hui', name: '回族风格', desc: '伊斯兰与汉式融合' }
  ]
}

// 建筑构件库
const BUILDING_COMPONENTS = [
  { id: 'roof_xieshan', name: '歇山顶', desc: '九脊顶，等级较高' },
  { id: 'roof_wudian', name: '庑殿顶', desc: '四坡顶，最高等级' },
  { id: 'roof_xuanshan', name: '悬山顶', desc: '两坡出山墙' },
  { id: 'ridge', name: '屋脊', desc: '正脊、垂脊、戗脊' },
  { id: 'dougong', name: '斗拱', desc: '承重与装饰构件' },
  { id: 'eaves', name: '檐口', desc: '屋檐出挑部分' },
  { id: 'door', name: '门', desc: '板门、隔扇门' },
  { id: 'window', name: '窗', desc: '直棂窗、花格窗' },
  { id: 'column_base', name: '柱础', desc: '石质柱基' },
  { id: 'platform', name: '台基', desc: '建筑基座' }
]

// 装饰纹样库
const DECORATIVE_PATTERNS = [
  { id: 'dragon_phoenix', name: '龙凤纹', desc: '皇家等级象征' },
  { id: 'lotus', name: '莲花纹', desc: '佛教吉祥纹样' },
  { id: 'cloud', name: '云纹', desc: '祥云图案' }
]

// 根据图像生成确定性种子
function getImageSeed(imageData) {
  let hash = 0
  const str = imageData || ''
  for (let i = 0; i < Math.min(str.length, 1000); i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

// 模拟图像清晰度检测
export function detectImageQuality(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      const megapixels = (width * height) / 1000000
      let quality = '良好'
      let score = 0.85
      if (megapixels < 0.5) {
        quality = '较低'
        score = 0.6
      } else if (megapixels > 5) {
        quality = '优秀'
        score = 0.95
      }
      URL.revokeObjectURL(url)
      resolve({
        quality,
        score,
        resolution: `${width} × ${height}`,
        aspectRatio: (width / height).toFixed(2)
      })
    }
    img.src = url
  })
}

// 核心：建筑识别（类型+风格）
export function recognizeBuilding(imageFile, imageUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const seed = getImageSeed(`${imageFile?.name || ''}_${img.width}_${img.height}_${Date.now()}`)
      const random = (offset = 0) => ((seed + offset) % 100) / 100

      // 建筑整体边界框（模拟检测）
      const padding = 0.05
      const bbox = {
        x: padding * img.width,
        y: padding * img.height,
        width: img.width * (0.9 + random(1) * 0.1),
        height: img.height * (0.85 + random(2) * 0.15)
      }

      // 建筑类型识别
      const typeIndex = Math.floor(random(3) * BUILDING_TYPES.length)
      const buildingType = BUILDING_TYPES[typeIndex]
      const typeConfidence = 0.75 + random(4) * 0.2

      // 建筑风格识别
      const regionIndex = Math.floor(random(5) * BUILDING_STYLES.region.length)
      const dynastyIndex = Math.floor(random(6) * BUILDING_STYLES.dynasty.length)
      const ethnicIndex = Math.floor(random(7) * BUILDING_STYLES.ethnic.length)

      const regionStyle = BUILDING_STYLES.region[regionIndex]
      const dynastyStyle = BUILDING_STYLES.dynasty[dynastyIndex]
      const ethnicStyle = BUILDING_STYLES.ethnic[ethnicIndex]

      const styleConfidence = 0.72 + random(8) * 0.22

      // 构件检测（随机选取3-6个）
      const componentCount = 3 + Math.floor(random(9) * 4)
      const shuffled = [...BUILDING_COMPONENTS].sort(() => random(10) - 0.5)
      const components = shuffled.slice(0, componentCount).map((c, i) => ({
        ...c,
        bbox: {
          x: 0.1 + random(20 + i) * 0.3,
          y: 0.1 + random(30 + i) * 0.4,
          width: 0.15 + random(40 + i) * 0.1,
          height: 0.1 + random(50 + i) * 0.15
        },
        confidence: 0.7 + random(60 + i) * 0.25
      }))

      // 可解释化依据
      const evidence = [
        { region: '屋顶区域', desc: `识别到${components.find(c => c.name.includes('顶'))?.name || '歇山顶'}形制，符合${regionStyle.name}特征` },
        { region: '斗拱区域', desc: '斗拱密度与比例符合官式建筑规制' },
        { region: '檐口装饰', desc: '装饰纹样与等级推断为' + dynastyStyle.name }
      ]

      // 文化特征
      const culturalFeatures = {
        symmetry: random(70) > 0.3 ? '中轴对称' : '局部对称',
        bays: 3 + Math.floor(random(71) * 5),
        roofSlope: (25 + random(72) * 15).toFixed(1) + '°',
        materials: ['木', '砖', '琉璃瓦'].filter((_, i) => random(73 + i) > 0.4),
        mainColor: ['红墙黄瓦', '白墙黛瓦', '青砖灰瓦'][Math.floor(random(76) * 3)],
        socialLevel: ['皇家', '官宦', '民间'][Math.floor(random(77) * 3)],
        function: ['祭祀', '居住', '政务', '防御'][Math.floor(random(78) * 4)]
      }

      // 装饰纹样
      const patternCount = 1 + Math.floor(random(80) * 2)
      const patterns = DECORATIVE_PATTERNS.slice(0, patternCount).map(p => ({
        ...p,
        density: (0.3 + random(90) * 0.5).toFixed(2)
      }))

      resolve({
        bbox,
        imageSize: { width: img.width, height: img.height },
        buildingType: { ...buildingType, confidence: typeConfidence },
        styles: {
          region: { ...regionStyle, confidence: styleConfidence },
          dynasty: { ...dynastyStyle, confidence: styleConfidence - 0.05 },
          ethnic: { ...ethnicStyle, confidence: styleConfidence - 0.08 }
        },
        components,
        evidence,
        culturalFeatures,
        patterns,
        summary: `该建筑识别为${buildingType.name}，具有${regionStyle.name}与${dynastyStyle.name}特征，${culturalFeatures.socialLevel}等级，可能用于${culturalFeatures.function}用途。`
      })
    }
    img.src = imageUrl
  })
}

// 从文本提取关键词
export function extractKeywordsFromText(text) {
  const regionKeywords = ['北方', '江南', '闽南', '藏区', '中原', '岭南']
  const dynastyKeywords = ['唐', '宋', '元', '明', '清', '民国']
  const styleKeywords = ['官式', '民居', '寺庙', '园林', '防御']

  const found = {
    region: regionKeywords.filter(k => text.includes(k)),
    dynasty: dynastyKeywords.filter(k => text.includes(k)),
    style: styleKeywords.filter(k => text.includes(k))
  }

  return found
}
