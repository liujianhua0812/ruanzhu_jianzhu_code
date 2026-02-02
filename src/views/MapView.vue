<template>
  <div class="map-view">
    <h1 class="page-title">建筑分布地图</h1>

    <!-- 模式切换 -->
    <div class="mode-tabs">
      <button
        v-for="m in mapModes"
        :key="m.value"
        class="mode-btn"
        :class="{ active: mapMode === m.value }"
        @click="mapMode = m.value"
      >
        <span class="mode-icon">{{ m.icon }}</span>
        {{ m.label }}
      </button>
    </div>

    <div class="map-container">
      <div class="map-wrapper">
        <div ref="mapContainerRef" class="map-container-inner"></div>
        <!-- 地图左上角图例浮层 -->
        <div v-if="['type', 'style'].includes(mapMode)" class="map-legend-float">
          <div class="map-legend-title">{{ mapMode === 'type' ? '类型' : '风格' }}</div>
          <div class="map-legend-list">
            <div v-for="item in (mapMode === 'type' ? activeTypes : activeStyles)" :key="item" class="map-legend-row">
              <span class="map-legend-dot" :style="{ background: (mapMode === 'type' ? typeColors : styleColors)[item] || '#888' }"></span>
              <span class="map-legend-label">{{ item }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="mapMode === 'heat'" class="map-legend-float map-legend-heat">
          <div class="map-legend-title">热力分布</div>
          <p class="map-legend-desc">颜色越深表示建筑越密集</p>
        </div>
        <!-- 地图右下角 AI 浮层 -->
        <div v-if="aiSummary.length" class="ai-float">
          <span class="ai-float-title">AI 分析</span>
          <p class="ai-float-text">{{ aiSummary[0] }}</p>
        </div>
      </div>

      <aside class="filter-panel">
        <h4>区域筛选</h4>
        <el-checkbox-group v-model="filterTypes">
          <el-checkbox label="宫殿建筑" />
          <el-checkbox label="宗教建筑" />
          <el-checkbox label="民居建筑" />
          <el-checkbox label="园林建筑" />
          <el-checkbox label="防御建筑" />
        </el-checkbox-group>

        <!-- 筛选结果统计 -->
        <div class="stats-section">
          <h4>筛选结果统计</h4>
          <div class="stat-count">
            <span class="count-num">{{ locations.filter(inTimeRange).length }}</span>
            <span class="count-label">当前显示建筑数量</span>
          </div>
          <div class="type-stats">
            <div
              v-for="item in typeStats"
              :key="item.type"
              class="type-stat-row"
            >
              <span class="type-name">{{ item.type }}</span>
              <span class="type-bar-wrap">
                <span
                  class="type-bar"
                  :style="{
                    width: item.percent + '%',
                    background: typeColors[item.type] || '#888'
                  }"
                />
              </span>
              <span class="type-num">{{ item.count }} ({{ item.percent }}%)</span>
            </div>
          </div>
        </div>

        <!-- 图例 -->
        <div v-if="mapMode === 'type'" class="legend legend-grid">
          <h4>类型图例</h4>
          <div class="legend-items">
            <div v-for="type in activeTypes" :key="type" class="legend-item">
              <span class="dot" :style="{ background: typeColors[type] || '#888' }"></span>
              <span class="legend-text">{{ type }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="mapMode === 'style'" class="legend legend-grid">
          <h4>风格图例</h4>
          <div class="legend-items">
            <div v-for="style in activeStyles" :key="style" class="legend-item">
              <span class="dot" :style="{ background: styleColors[style] || '#888' }"></span>
              <span class="legend-text">{{ style }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="mapMode === 'heat'" class="legend">
          <h4>热力说明</h4>
          <p class="legend-desc">颜色越深表示建筑越密集</p>
        </div>

        <div v-if="selectedLoc" class="loc-detail">
          <h4>{{ selectedLoc.name }}</h4>
          <p>类型：{{ selectedLoc.type }}</p>
          <p>风格：{{ selectedLoc.style }}</p>
          <p>位置：{{ selectedLoc.city }}</p>
          <p v-if="selectedLoc.dynasty">朝代：{{ selectedLoc.dynasty }}</p>
          <p v-if="selectedLoc.yearStart">年代：{{ selectedLoc.yearStart }}–{{ selectedLoc.yearEnd }}</p>
        </div>

        <!-- AI分析摘要 -->
        <div class="ai-summary">
          <h4>AI分析摘要</h4>
          <ul v-if="aiSummary.length" class="ai-summary-list">
            <li v-for="(item, i) in aiSummary" :key="i">{{ item }}</li>
          </ul>
          <p v-else class="ai-summary-empty">暂无符合筛选条件的建筑，请调整筛选条件</p>
        </div>
      </aside>
    </div>

    <!-- 时间轴 -->
    <div class="timeline-section">
      <h4>时间筛选</h4>
      <div class="timeline-controls">
        <div class="dynasty-tabs">
          <button
            v-for="d in dynastyOptions"
            :key="d.value"
            class="dynasty-btn"
            :class="{ active: timeMode === 'dynasty' && selectedDynasty === d.value }"
            @click="selectDynasty(d.value)"
          >
            {{ d.label }}
          </button>
        </div>
        <div class="year-slider-wrap">
          <span class="slider-label">年代范围</span>
          <div class="slider-row">
            <span class="year-min">{{ yearRange[0] }}</span>
            <el-slider
              v-model="yearRange"
              range
              :min="600"
              :max="1911"
              :step="10"
              @change="onYearRangeChange"
            />
            <span class="year-max">{{ yearRange[1] }}</span>
          </div>
        </div>
      </div>
      <div class="timeline-hint">
        <span v-if="timeMode === 'dynasty'">当前：{{ selectedDynasty === 'all' ? '全部朝代' : selectedDynasty + '代' }}</span>
        <span v-else>当前：{{ yearRange[0] }}–{{ yearRange[1] }} 年</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { buildingLocations, dynastyRanges } from '@/data/mapData'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapContainerRef = ref(null)
const resizeObserverRef = ref(null)
let map = null
let markerLayer = null

const selectedLoc = ref(null)
const filterTypes = ref(['宫殿建筑', '宗教建筑', '民居建筑', '园林建筑', '防御建筑'])
const mapMode = ref('point') // point | heat | type | style
const timeMode = ref('dynasty') // dynasty | range
const selectedDynasty = ref('all')
const yearRange = ref([600, 1911])

const dynastyOptions = [
  { value: 'all', label: '全部' },
  { value: '唐', label: '唐' },
  { value: '宋', label: '宋' },
  { value: '明', label: '明' },
  { value: '清', label: '清' }
]

const mapModes = [
  { value: 'point', label: '点位模式', icon: '📍' },
  { value: 'heat', label: '热力分布', icon: '🔥' },
  { value: 'type', label: '类型分布', icon: '🏛' },
  { value: 'style', label: '风格分布', icon: '🎨' }
]

const typeColors = {
  '宫殿建筑': '#8B4513',
  '宗教建筑': '#6B8E23',
  '民居建筑': '#CD853F',
  '园林建筑': '#228B22',
  '防御建筑': '#A0522D'
}

const styleColors = {
  '北方官式': '#8B4513',
  '北方皇家': '#B8860B',
  '藏式': '#4B0082',
  '江南水乡': '#20B2AA',
  '闽南': '#DC143C',
  '徽派': '#2E8B57'
}

const locations = computed(() =>
  buildingLocations.filter(loc => filterTypes.value.includes(loc.type))
)

function inTimeRange(loc) {
  if (!loc.dynasty && !loc.yearStart) return true
  if (timeMode.value === 'dynasty') {
    if (selectedDynasty.value === 'all') return true
    return loc.dynasty === selectedDynasty.value
  }
  const [min, max] = yearRange.value
  return loc.yearStart <= max && loc.yearEnd >= min
}

const displayLocations = computed(() =>
  locations.value.map(loc => ({ ...loc, _faded: !inTimeRange(loc) }))
)

const activeTypes = computed(() =>
  [...new Set(locations.value.map(l => l.type))]
)

const typeStats = computed(() => {
  const inRange = locations.value.filter(inTimeRange)
  const total = inRange.length
  if (total === 0) return []
  const byType = {}
  inRange.forEach(loc => {
    byType[loc.type] = (byType[loc.type] || 0) + 1
  })
  return filterTypes.value
    .filter(t => byType[t] > 0)
    .map(type => ({
      type,
      count: byType[type],
      percent: Math.round((byType[type] / total) * 100)
    }))
})

const activeStyles = computed(() =>
  [...new Set(locations.value.map(l => l.style))]
)

// AI 分析摘要
const aiSummary = computed(() => {
  const inRange = locations.value.filter(inTimeRange)
  if (inRange.length === 0) return []

  const total = inRange.length
  const byType = {}
  const byStyle = {}
  const byDynasty = {}
  const byRegion = {}

  inRange.forEach(loc => {
    byType[loc.type] = (byType[loc.type] || 0) + 1
    byStyle[loc.style] = (byStyle[loc.style] || 0) + 1
    if (loc.dynasty) byDynasty[loc.dynasty] = (byDynasty[loc.dynasty] || 0) + 1
    const region = getRegion(loc)
    byRegion[region] = (byRegion[region] || 0) + 1
  })

  const summary = []
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]
  if (topType) {
    const pct = Math.round((topType[1] / total) * 100)
    summary.push(`当前区域以${topType[0]}为主，占比约 ${pct}%`)
  }
  if (byType['宗教建筑'] && byType['宗教建筑'] >= 2) {
    const religionLocs = inRange.filter(l => l.type === '宗教建筑')
    const religionByRegion = {}
    religionLocs.forEach(l => {
      const r = getRegion(l)
      religionByRegion[r] = (religionByRegion[r] || 0) + 1
    })
    const mainRegion = Object.entries(religionByRegion).sort((a, b) => b[1] - a[1])[0]
    if (mainRegion) {
      const regionNames = { north: '华北', east: '华东', west: '西北', south: '闽南', tibet: '藏区' }
      summary.push(`宗教建筑主要集中在${regionNames[mainRegion[0]] || mainRegion[0]}区域`)
    }
  }
  const topDynasty = Object.entries(byDynasty).sort((a, b) => b[1] - a[1])[0]
  if (topDynasty && topDynasty[1] >= 2) {
    const pct = Math.round((topDynasty[1] / total) * 100)
    summary.push(`${topDynasty[0]}代风格建筑分布密集，占比 ${pct}%，反映历史开发集中期`)
  }
  const styleCount = Object.keys(byStyle).length
  if (styleCount >= 3) {
    summary.push(`建筑风格多样，涵盖 ${styleCount} 种地域/朝代风格`)
  }
  const topRegion = Object.entries(byRegion).sort((a, b) => b[1] - a[1])[0]
  if (topRegion && topRegion[1] >= 3) {
    const regionNames = { north: '华北', east: '华东', west: '西北', south: '闽南', tibet: '藏区' }
    const pct = Math.round((topRegion[1] / total) * 100)
    summary.push(`${regionNames[topRegion[0]] || topRegion[0]}区域建筑集中，占 ${pct}%`)
  }
  return summary
})

function getRegion(loc) {
  if (loc.lat > 35 && loc.lng > 100) return 'north'
  if (loc.lat < 30 && loc.lng < 95) return 'tibet'
  if (loc.lat < 28 && loc.lng > 115) return 'south'
  if (loc.lat > 33 && loc.lng < 110) return 'west'
  return 'east'
}

function selectDynasty(d) {
  timeMode.value = 'dynasty'
  selectedDynasty.value = d
  if (d !== 'all') {
    const r = dynastyRanges[d]
    if (r) yearRange.value = [r.start, r.end]
  }
}

function onYearRangeChange() {
  timeMode.value = 'range'
  selectedDynasty.value = 'all'
}

watch(displayLocations, () => {
  if (selectedLoc.value) {
    const disp = displayLocations.value.find(l => l.id === selectedLoc.value.id)
    if (disp?._faded) selectedLoc.value = null
  }
}, { deep: true })

function getMarkerColor(loc) {
  if (mapMode.value === 'point') return '#8B4513'
  if (mapMode.value === 'type') return typeColors[loc.type] || '#888'
  if (mapMode.value === 'style') return styleColors[loc.style] || '#888'
  return '#8B4513'
}

function updateMarkerLayer() {
  if (!map || !markerLayer) return

  markerLayer.clearLayers()

  const locs = displayLocations.value
  const isHeat = mapMode.value === 'heat'

  locs.forEach(loc => {
    const color = getMarkerColor(loc)
    const opacity = loc._faded ? 0.25 : 1

    if (isHeat) {
      const circle = L.circle([loc.lat, loc.lng], {
        radius: 50000,
        color: color,
        fillColor: color,
        fillOpacity: loc._faded ? 0.1 : 0.25,
        weight: 1
      })
      const dot = L.circleMarker([loc.lat, loc.lng], {
        radius: 8,
        color: '#fff',
        fillColor: color,
        fillOpacity: opacity,
        weight: 2
      })
      const popupContent = `<strong>${loc.name}</strong><br/>${loc.type} · ${loc.style}<br/>${loc.city}`
      circle.bindPopup(popupContent).bindTooltip(loc.name, { permanent: false, direction: 'top', offset: [0, -8] })
      dot.bindPopup(popupContent).bindTooltip(loc.name, { permanent: false, direction: 'top', offset: [0, -8] })
      circle.on('click', () => { selectedLoc.value = loc._faded ? null : loc })
      dot.on('click', () => { selectedLoc.value = loc._faded ? null : loc })
      markerLayer.addLayer(circle)
      markerLayer.addLayer(dot)
    } else {
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 12,
        color: selectedLoc.value?.id === loc.id ? '#c9a227' : '#fff',
        fillColor: color,
        fillOpacity: opacity,
        weight: 2
      })
      const popupContent = `<strong>${loc.name}</strong><br/>${loc.type} · ${loc.style}<br/>${loc.city}`
      marker.bindPopup(popupContent).bindTooltip(loc.name, { permanent: false, direction: 'top', offset: [0, -12] })
      marker.on('click', () => { selectedLoc.value = loc._faded ? null : loc })
      markerLayer.addLayer(marker)
    }
  })
}

onMounted(async () => {
  await nextTick()
  if (!mapContainerRef.value) return

  map = L.map(mapContainerRef.value, {
    center: [35, 105],
    zoom: 4,
    zoomControl: false
  })

  L.control.zoom({ position: 'topright' }).addTo(map)

  const tileLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      minZoom: 3
    }
  )
  tileLayer.addTo(map)

  markerLayer = L.layerGroup().addTo(map)

  updateMarkerLayer()

  requestAnimationFrame(() => {
    map.invalidateSize()
    if (displayLocations.value.length > 0) {
      const bounds = L.latLngBounds(displayLocations.value.map(l => [l.lat, l.lng]))
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 })
    }
  })

  resizeObserverRef.value = new ResizeObserver(() => {
    map?.invalidateSize()
  })
  resizeObserverRef.value.observe(mapContainerRef.value)
})

onUnmounted(() => {
  resizeObserverRef.value?.disconnect()
  if (map) {
    map.remove()
    map = null
  }
})

watch([mapMode, displayLocations, selectedLoc], () => {
  updateMarkerLayer()
}, { deep: true })
</script>

<style lang="scss" scoped>
.map-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.mode-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  .mode-icon {
    font-size: 1rem;
  }

  &:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }

  &.active {
    background: rgba(139, 69, 19, 0.15);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }
}

.map-container {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 1.5rem;
  position: relative;
  align-items: stretch;
}

.map-wrapper {
  position: relative;
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  min-height: 420px;
  width: 100%;
}

.map-container-inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.map-legend-float {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.6rem 0.9rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  z-index: 1000;

  .map-legend-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid var(--border-color);
  }

  .map-legend-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .map-legend-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    color: var(--text-primary);
  }

  .map-legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .map-legend-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90px;
  }

  &.map-legend-heat .map-legend-desc {
    font-size: 0.78rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }
}

.ai-float {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  max-width: 280px;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;

  .ai-float-title {
    display: block;
    font-size: 0.75rem;
    opacity: 0.85;
    margin-bottom: 0.35rem;
  }

  .ai-float-text {
    font-size: 0.85rem;
    margin: 0;
    line-height: 1.4;
  }
}

.filter-panel {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  height: fit-content;
}

.filter-panel h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.stats-section {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(139, 69, 19, 0.06);
  border-radius: 8px;

  h4 {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
  }
}

.stat-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);

  .count-num {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--accent-primary);
  }

  .count-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }
}

.type-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.type-stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;

  .type-name {
    flex-shrink: 0;
    min-width: 72px;
  }

  .type-bar-wrap {
    flex: 1;
    height: 8px;
    background: rgba(139, 69, 19, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .type-bar {
    display: block;
    height: 100%;
    border-radius: 4px;
    min-width: 2px;
    transition: width 0.3s;
  }

  .type-num {
    flex-shrink: 0;
    min-width: 48px;
    text-align: right;
    color: var(--text-secondary);
    font-size: 0.8rem;
  }
}

.legend {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(139, 69, 19, 0.05);
  border-radius: 8px;

  h4 {
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
    flex-shrink: 0;
  }

  .legend-desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
  }
}

.legend-grid .legend-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  min-width: 0;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .legend-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.loc-detail {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(139, 69, 19, 0.06);
  border-radius: 8px;
}

.loc-detail p {
  font-size: 0.9rem;
  margin: 0.25rem 0;
}

.ai-summary {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.08) 0%, rgba(201, 162, 39, 0.06) 100%);
  border-radius: 8px;
  border: 1px solid rgba(139, 69, 19, 0.15);

  h4 {
    font-size: 0.95rem;
    margin-bottom: 0.6rem;
    color: var(--accent-primary);
    display: flex;
    align-items: center;
    gap: 0.35rem;

    &::before {
      content: '✦';
      font-size: 0.85rem;
    }
  }
}

.ai-summary-list {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--text-primary);

  li {
    margin-bottom: 0.4rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.ai-summary-empty {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin: 0;
}

.timeline-section {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);

  h4 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
}

.timeline-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dynasty-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.dynasty-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }

  &.active {
    background: rgba(139, 69, 19, 0.15);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }
}

.year-slider-wrap {
  .slider-label {
    display: block;
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .year-min,
    .year-max {
      font-size: 0.85rem;
      color: var(--text-secondary);
      min-width: 36px;
    }

    .el-slider {
      flex: 1;
    }
  }
}

.timeline-hint {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
