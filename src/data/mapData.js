// 中国主要传统建筑分布（模拟数据）
// 含扩展点位用于热力分布可视化
// dynasty: 主要朝代 | yearStart/yearEnd: 建造/兴盛年代范围（用于时间轴筛选）
export const buildingLocations = [
  // 华北/北京区域（密集）
  { id: 1, name: '故宫', type: '宫殿建筑', style: '北方官式', lat: 39.9163, lng: 116.3972, city: '北京', dynasty: '明', yearStart: 1420, yearEnd: 1911 },
  { id: 8, name: '颐和园', type: '园林建筑', style: '北方皇家', lat: 39.9998, lng: 116.2754, city: '北京', dynasty: '清', yearStart: 1750, yearEnd: 1900 },
  { id: 9, name: '天坛', type: '宗教建筑', style: '北方官式', lat: 39.8822, lng: 116.4065, city: '北京', dynasty: '明', yearStart: 1420, yearEnd: 1540 },
  { id: 10, name: '雍和宫', type: '宗教建筑', style: '北方官式', lat: 39.9492, lng: 116.4172, city: '北京', dynasty: '清', yearStart: 1694, yearEnd: 1744 },
  { id: 11, name: '恭王府', type: '民居建筑', style: '北方官式', lat: 39.9345, lng: 116.3789, city: '北京', dynasty: '清', yearStart: 1776, yearEnd: 1851 },
  // 华东/江南区域（密集）
  { id: 3, name: '苏州园林', type: '园林建筑', style: '江南水乡', lat: 31.2989, lng: 120.5853, city: '苏州', dynasty: '明', yearStart: 1509, yearEnd: 1644 },
  { id: 7, name: '宏村', type: '民居建筑', style: '徽派', lat: 29.9042, lng: 117.9937, city: '黄山', dynasty: '明', yearStart: 1400, yearEnd: 1600 },
  { id: 12, name: '拙政园', type: '园林建筑', style: '江南水乡', lat: 31.3234, lng: 120.6289, city: '苏州', dynasty: '明', yearStart: 1509, yearEnd: 1522 },
  { id: 13, name: '留园', type: '园林建筑', style: '江南水乡', lat: 31.3156, lng: 120.5923, city: '苏州', dynasty: '明', yearStart: 1593, yearEnd: 1644 },
  { id: 14, name: '西递', type: '民居建筑', style: '徽派', lat: 29.9234, lng: 117.9856, city: '黄山', dynasty: '明', yearStart: 1350, yearEnd: 1650 },
  { id: 15, name: '灵隐寺', type: '宗教建筑', style: '江南水乡', lat: 30.2412, lng: 120.0956, city: '杭州', dynasty: '宋', yearStart: 970, yearEnd: 1279 },
  // 曲阜/山东
  { id: 6, name: '曲阜孔庙', type: '宗教建筑', style: '北方官式', lat: 35.5801, lng: 116.9865, city: '曲阜', dynasty: '明', yearStart: 1499, yearEnd: 1730 },
  { id: 16, name: '泰山岱庙', type: '宗教建筑', style: '北方官式', lat: 36.2012, lng: 117.1234, city: '泰安', dynasty: '宋', yearStart: 1009, yearEnd: 1279 },
  // 西安/西北
  { id: 5, name: '西安城墙', type: '防御建筑', style: '北方官式', lat: 34.2658, lng: 108.9442, city: '西安', dynasty: '明', yearStart: 1370, yearEnd: 1378 },
  { id: 17, name: '大雁塔', type: '宗教建筑', style: '北方官式', lat: 34.2189, lng: 108.9645, city: '西安', dynasty: '唐', yearStart: 652, yearEnd: 704 },
  { id: 18, name: '华清宫', type: '宫殿建筑', style: '北方官式', lat: 34.3623, lng: 109.2134, city: '西安', dynasty: '唐', yearStart: 723, yearEnd: 907 },
  // 闽南/福建
  { id: 4, name: '福建土楼', type: '民居建筑', style: '闽南', lat: 24.7237, lng: 116.7235, city: '龙岩', dynasty: '明', yearStart: 1368, yearEnd: 1644 },
  { id: 19, name: '永定土楼群', type: '民居建筑', style: '闽南', lat: 24.6892, lng: 116.7856, city: '龙岩', dynasty: '清', yearStart: 1644, yearEnd: 1900 },
  { id: 20, name: '南靖土楼', type: '民居建筑', style: '闽南', lat: 24.5123, lng: 117.0234, city: '漳州', dynasty: '明', yearStart: 1368, yearEnd: 1644 },
  // 藏区
  { id: 2, name: '布达拉宫', type: '宗教建筑', style: '藏式', lat: 29.6578, lng: 91.1169, city: '拉萨', dynasty: '清', yearStart: 1645, yearEnd: 1694 },
  { id: 21, name: '大昭寺', type: '宗教建筑', style: '藏式', lat: 29.6523, lng: 91.1289, city: '拉萨', dynasty: '唐', yearStart: 647, yearEnd: 707 },
  { id: 22, name: '扎什伦布寺', type: '宗教建筑', style: '藏式', lat: 29.2678, lng: 88.8834, city: '日喀则', dynasty: '明', yearStart: 1447, yearEnd: 1478 }
]

// 朝代年代范围（用于时间轴）
export const dynastyRanges = {
  唐: { start: 618, end: 907 },
  宋: { start: 960, end: 1279 },
  明: { start: 1368, end: 1644 },
  清: { start: 1644, end: 1911 }
}
