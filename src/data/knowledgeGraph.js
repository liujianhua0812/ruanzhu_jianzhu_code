// 建筑文化知识图谱数据（前端静态）
// 整合建筑类型、朝代、地域、文化、构件、纹样、典型建筑等

// 节点类型：building, dynasty, region, culture, component, pattern, landmark
export const knowledgeNodes = [
  // 建筑类型
  { id: 'palace', name: '宫殿建筑', type: 'building', x: 400, y: 80 },
  { id: 'religious', name: '宗教建筑', type: 'building', x: 180, y: 180 },
  { id: 'residential', name: '民居建筑', type: 'building', x: 620, y: 180 },
  { id: 'garden', name: '园林建筑', type: 'building', x: 400, y: 280 },
  { id: 'defense', name: '防御建筑', type: 'building', x: 400, y: 360 },
  // 朝代
  { id: 'tang', name: '唐代', type: 'dynasty', x: 80, y: 120 },
  { id: 'song', name: '宋代', type: 'dynasty', x: 80, y: 200 },
  { id: 'ming', name: '明代', type: 'dynasty', x: 80, y: 280 },
  { id: 'qing', name: '清代', type: 'dynasty', x: 80, y: 360 },
  // 地域风格
  { id: 'north', name: '北方官式', type: 'region', x: 300, y: 50 },
  { id: 'jiangnan', name: '江南水乡', type: 'region', x: 500, y: 50 },
  { id: 'minnan', name: '闽南建筑', type: 'region', x: 700, y: 120 },
  { id: 'tibetan', name: '藏式建筑', type: 'region', x: 100, y: 400 },
  { id: 'huizhou', name: '徽派建筑', type: 'region', x: 700, y: 260 },
  // 文化属性
  { id: 'ritual', name: '祭祀文化', type: 'culture', x: 200, y: 400 },
  { id: 'living', name: '居住文化', type: 'culture', x: 600, y: 400 },
  { id: 'defense_culture', name: '防御文化', type: 'culture', x: 400, y: 420 },
  // 典型构件
  { id: 'dougong', name: '斗拱', type: 'component', x: 250, y: 320 },
  { id: 'roof_xieshan', name: '歇山顶', type: 'component', x: 550, y: 320 },
  { id: 'platform', name: '台基', type: 'component', x: 250, y: 200 },
  { id: 'eaves', name: '檐口', type: 'component', x: 550, y: 200 },
  // 装饰纹样
  { id: 'dragon_phoenix', name: '龙凤纹', type: 'pattern', x: 700, y: 350 },
  { id: 'lotus', name: '莲花纹', type: 'pattern', x: 100, y: 280 },
  { id: 'cloud', name: '云纹', type: 'pattern', x: 700, y: 50 },
  // 典型建筑
  { id: 'forbidden', name: '故宫', type: 'landmark', x: 350, y: 150 },
  { id: 'potala', name: '布达拉宫', type: 'landmark', x: 150, y: 350 },
  { id: 'suzhou_garden', name: '苏州园林', type: 'landmark', x: 550, y: 250 },
  { id: 'fujian_tulou', name: '福建土楼', type: 'landmark', x: 650, y: 350 }
]

export const knowledgeEdges = [
  // 建筑-朝代
  { source: 'palace', target: 'qing', label: '盛行于' },
  { source: 'palace', target: 'ming', label: '盛行于' },
  { source: 'religious', target: 'ming', label: '盛行于' },
  { source: 'religious', target: 'tang', label: '盛行于' },
  { source: 'residential', target: 'ming', label: '盛行于' },
  { source: 'residential', target: 'qing', label: '盛行于' },
  { source: 'garden', target: 'ming', label: '盛行于' },
  { source: 'garden', target: 'qing', label: '盛行于' },
  { source: 'defense', target: 'ming', label: '盛行于' },
  // 建筑-地域
  { source: 'palace', target: 'north', label: '地域风格' },
  { source: 'religious', target: 'north', label: '地域风格' },
  { source: 'religious', target: 'tibetan', label: '地域风格' },
  { source: 'residential', target: 'jiangnan', label: '地域风格' },
  { source: 'residential', target: 'minnan', label: '地域风格' },
  { source: 'residential', target: 'huizhou', label: '地域风格' },
  { source: 'garden', target: 'jiangnan', label: '地域风格' },
  { source: 'garden', target: 'north', label: '地域风格' },
  { source: 'defense', target: 'north', label: '地域风格' },
  { source: 'defense', target: 'minnan', label: '地域风格' },
  // 建筑-文化
  { source: 'religious', target: 'ritual', label: '功能' },
  { source: 'residential', target: 'living', label: '功能' },
  { source: 'defense', target: 'defense_culture', label: '功能' },
  { source: 'palace', target: 'ritual', label: '关联' },
  // 建筑-构件
  { source: 'palace', target: 'dougong', label: '典型构件' },
  { source: 'palace', target: 'roof_xieshan', label: '典型构件' },
  { source: 'palace', target: 'platform', label: '典型构件' },
  { source: 'religious', target: 'dougong', label: '典型构件' },
  { source: 'religious', target: 'eaves', label: '典型构件' },
  { source: 'residential', target: 'eaves', label: '典型构件' },
  { source: 'garden', target: 'eaves', label: '典型构件' },
  // 建筑-纹样
  { source: 'palace', target: 'dragon_phoenix', label: '装饰纹样' },
  { source: 'palace', target: 'cloud', label: '装饰纹样' },
  { source: 'religious', target: 'lotus', label: '装饰纹样' },
  { source: 'religious', target: 'cloud', label: '装饰纹样' },
  // 建筑-典型建筑
  { source: 'palace', target: 'forbidden', label: '代表' },
  { source: 'religious', target: 'potala', label: '代表' },
  { source: 'garden', target: 'suzhou_garden', label: '代表' },
  { source: 'residential', target: 'fujian_tulou', label: '代表' },
  // 朝代-地域
  { source: 'qing', target: 'north', label: '盛行地域' },
  { source: 'ming', target: 'jiangnan', label: '盛行地域' },
  { source: 'tang', target: 'north', label: '盛行地域' },
  { source: 'song', target: 'jiangnan', label: '盛行地域' }
]

// 节点详情（扩展信息）
export const nodeDetails = {
  palace: {
    desc: '皇家宫殿、衙署等官方建筑，以中轴对称、等级分明为特征。',
    features: ['中轴对称', '等级规制', '斗拱繁密', '琉璃瓦顶'],
    period: '明清时期最为兴盛',
    relatedTerms: ['官式建筑', '礼制', '等级制度']
  },
  religious: {
    desc: '寺庙、道观、佛塔等宗教建筑，体现信仰与地域文化融合。',
    features: ['塔刹', '经幢', '山门', '大雄宝殿'],
    period: '唐代以降历代均有发展',
    relatedTerms: ['佛教建筑', '道教建筑', '宗教仪式']
  },
  residential: {
    desc: '四合院、土楼、窑洞等民居建筑，体现居住文化与地域适应性。',
    features: ['合院布局', '天井采光', '木构架', '地方材料'],
    period: '明清民居遗存最丰',
    relatedTerms: ['民居形制', '风水', '家族聚居']
  },
  garden: {
    desc: '亭台楼阁、廊桥水榭，体现山水意境与文人审美。',
    features: ['借景', '叠石', '水景', '曲径通幽'],
    period: '宋代成熟，明清鼎盛',
    relatedTerms: ['园林艺术', '文人园林', '山水画意']
  },
  defense: {
    desc: '城墙、寨堡、关隘等防御建筑，兼具军事与聚居功能。',
    features: ['夯土城墙', '瓮城', '马面', '垛口'],
    period: '明代城墙体系最为完备',
    relatedTerms: ['城防体系', '军事建筑', '聚落防御']
  },
  tang: {
    desc: '618-907年，建筑风格雄浑大气，斗拱硕大，出檐深远。',
    features: ['斗拱硕大', '出檐深远', '屋顶平缓', '体量宏大'],
    period: '618-907年',
    relatedTerms: ['唐风', '遗构稀少', '佛光寺']
  },
  song: {
    desc: '960-1279年，建筑风格典雅精致，比例和谐，注重细节。',
    features: ['比例和谐', '装饰适度', '营造法式', '彩画精美'],
    period: '960-1279年',
    relatedTerms: ['宋式', '营造法式', '晋祠']
  },
  ming: {
    desc: '1368-1644年，建筑稳重端庄，装饰适度，规制成熟。',
    features: ['稳重端庄', '装饰适度', '官式成熟', '砖石普及'],
    period: '1368-1644年',
    relatedTerms: ['明式', '官式建筑', '紫禁城']
  },
  qing: {
    desc: '1644-1919年，建筑繁复华丽，等级分明，装饰细密。',
    features: ['繁复华丽', '等级分明', '彩画细密', '琉璃瓦普及'],
    period: '1644-1919年',
    relatedTerms: ['清式', '工部则例', '颐和园']
  },
  north: {
    desc: '北方官式建筑，庄重对称，斗拱繁密，多见于宫殿、坛庙。',
    scope: '华北、东北、西北部分地区',
    relatedTerms: ['官式', '斗拱', '琉璃瓦']
  },
  jiangnan: {
    desc: '江南水乡建筑，白墙黛瓦，轻盈秀美，多见于民居、园林。',
    scope: '苏南、浙北、皖南',
    relatedTerms: ['白墙黛瓦', '马头墙', '水乡']
  },
  minnan: {
    desc: '闽南建筑，红砖燕尾，装饰华丽，多见于闽南、台湾。',
    scope: '闽南、台湾、潮汕',
    relatedTerms: ['红砖', '燕尾脊', '剪瓷雕']
  },
  tibetan: {
    desc: '藏式建筑，碉房式，色彩浓烈，多见于藏区寺庙、民居。',
    scope: '西藏、青海、川西、滇西北',
    relatedTerms: ['碉房', '金顶', '红白墙']
  },
  huizhou: {
    desc: '徽派建筑，白墙黛瓦，马头墙，砖雕木雕石雕精美。',
    scope: '皖南、赣北',
    relatedTerms: ['马头墙', '三雕', '天井']
  },
  ritual: {
    desc: '祭祀文化贯穿传统建筑，坛庙、宗祠、陵墓均体现礼制。',
    relatedTerms: ['礼制', '宗庙', '祭祀']
  },
  living: {
    desc: '居住文化体现家族观念、风水观念与地域适应性。',
    relatedTerms: ['四合院', '天井', '家族']
  },
  defense_culture: {
    desc: '防御文化体现军事需求与聚落安全，城防体系历史悠久。',
    relatedTerms: ['城防', '军事', '聚落']
  },
  dougong: {
    desc: '斗拱是中国传统建筑特有的承重与装饰构件，由斗、拱、昂等组成。',
    usage: '宫殿、寺庙、重要建筑',
    evolution: '唐代硕大，宋代规范，明清装饰化'
  },
  roof_xieshan: {
    desc: '歇山顶，九脊顶，等级仅次于庑殿顶，常见于宫殿、寺庙。',
    usage: '宫殿、寺庙、重要建筑',
    evolution: '唐代已有，宋代成熟'
  },
  platform: {
    desc: '台基是建筑基座，等级越高台基越高，可设须弥座。',
    usage: '所有建筑',
    evolution: '历代均有，等级规制不同'
  },
  eaves: {
    desc: '檐口是屋檐出挑部分，包含椽、飞椽、瓦当等。',
    usage: '所有建筑',
    evolution: '历代形制变化'
  },
  dragon_phoenix: {
    desc: '龙凤纹为皇家等级象征，多见于宫殿、坛庙装饰。',
    usage: '宫殿、皇家建筑',
    meaning: '皇权、吉祥'
  },
  lotus: {
    desc: '莲花纹为佛教吉祥纹样，象征清净、出淤泥而不染。',
    usage: '寺庙、宗教建筑',
    meaning: '佛教、吉祥'
  },
  cloud: {
    desc: '云纹为祥云图案，寓意吉祥，广泛用于各类建筑。',
    usage: '各类建筑',
    meaning: '吉祥、祥瑞'
  },
  forbidden: {
    desc: '明清故宫，世界上现存规模最大、保存最完整的木结构古建筑群。',
    location: '北京',
    built: '明永乐十八年',
    highlight: '重檐庑殿顶、金銮殿、三大殿'
  },
  potala: {
    desc: '藏式建筑杰作，世界海拔最高宫堡建筑群，藏传佛教圣地。',
    location: '拉萨',
    built: '17世纪',
    highlight: '白宫、红宫、金顶'
  },
  suzhou_garden: {
    desc: '江南私家园林代表，以拙政园、留园等闻名，体现文人山水意境。',
    location: '苏州',
    built: '明清',
    highlight: '借景、叠石、水景'
  },
  fujian_tulou: {
    desc: '福建土楼，世界独特民居形式，夯土围合，兼具居住与防御。',
    location: '闽西',
    built: '明清',
    highlight: '圆形土楼、方形土楼、夯土'
  }
}

// 相似建筑推荐
export const similarBuildings = {
  palace: [
    { name: '故宫太和殿', style: '北方官式 · 清代', desc: '重檐庑殿顶，最高等级' },
    { name: '曲阜孔庙大成殿', style: '北方官式 · 清代', desc: '歇山顶，祭祀建筑' },
    { name: '沈阳故宫', style: '北方官式 · 清代', desc: '满汉融合建筑风格' }
  ],
  religious: [
    { name: '少林寺', style: '北方 · 明代', desc: '禅宗祖庭' },
    { name: '灵隐寺', style: '江南 · 清代', desc: '江南名刹' },
    { name: '塔尔寺', style: '藏式 · 明代', desc: '藏传佛教格鲁派' }
  ],
  residential: [
    { name: '宏村古民居', style: '徽派 · 明清', desc: '白墙黛瓦' },
    { name: '福建土楼', style: '闽南 · 明清', desc: '夯土围合' },
    { name: '北京四合院', style: '北方 · 明清', desc: '中轴对称合院' }
  ],
  garden: [
    { name: '苏州拙政园', style: '江南园林 · 明代', desc: '中国四大名园' },
    { name: '颐和园', style: '北方皇家园林 · 清代', desc: '皇家园林典范' },
    { name: '承德避暑山庄', style: '北方 · 清代', desc: '皇家园林与山水' }
  ],
  defense: [
    { name: '西安城墙', style: '北方 · 明代', desc: '现存最完整古城墙' },
    { name: '福建永定土楼', style: '闽南 · 明清', desc: '兼具居住与防御' },
    { name: '平遥古城', style: '北方 · 明清', desc: '完整古城格局' }
  ]
}

// 朝代年表（用于时间轴展示）
export const dynastyTimeline = [
  { id: 'tang', name: '唐代', start: 618, end: 907, color: '#8B4513' },
  { id: 'song', name: '宋代', start: 960, end: 1279, color: '#A0522D' },
  { id: 'ming', name: '明代', start: 1368, end: 1644, color: '#CD853F' },
  { id: 'qing', name: '清代', start: 1644, end: 1919, color: '#D2691E' }
]

// 统计：各类型节点数量
export const nodeTypeStats = {
  building: 5,
  dynasty: 4,
  region: 5,
  culture: 3,
  component: 4,
  pattern: 3,
  landmark: 4
}
