<template>
  <div class="similarity-view">
    <h1 class="page-title">建筑风格相似性分析与智能检索</h1>

    <div v-if="!store.images.length" class="empty-state">
      <el-icon class="empty-icon"><Location /></el-icon>
      <p>暂无已识别的建筑数据</p>
      <p class="hint">请先在「建筑识别」页面上传建筑图片完成识别</p>
      <el-button type="primary" @click="$router.push('/recognize')">前往识别</el-button>
    </div>

    <template v-else>
      <div class="main-layout">
        <!-- 左侧：风格嵌入空间图 -->
        <div class="chart-area">
          <el-card>
            <template #header>
              <div class="chart-header">
                <span>二维风格嵌入空间</span>
                <div class="chart-controls">
                  <el-radio-group v-model="colorBy" size="small" @change="updateChart">
                    <el-radio-button value="type">按类型</el-radio-button>
                    <el-radio-button value="dynasty">按朝代</el-radio-button>
                    <el-radio-button value="region">按地域</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </template>
            <div ref="chartRef" class="embedding-chart"></div>
            <p class="chart-hint">每个点代表一栋建筑，点间距离表示风格相似度，支持拖拽缩放</p>
          </el-card>
        </div>

        <!-- 右侧：Top-N 相似建筑 + 筛选 -->
        <div class="sidebar">
          <el-card v-if="selectedId" class="selected-card">
            <template #header>
              <span>当前选中建筑</span>
              <el-button size="small" type="primary" @click="addToCompare(selectedId)">加入对比</el-button>
            </template>
            <div class="selected-preview">
              <img :src="store.getImageById(selectedId)?.url" alt="" />
              <div class="selected-info">
                <p class="type">{{ store.getImageById(selectedId)?.result?.buildingType?.name }}</p>
                <p class="style">{{ store.getImageById(selectedId)?.result?.styles?.region?.name }} · {{ store.getImageById(selectedId)?.result?.styles?.dynasty?.name }}</p>
              </div>
            </div>
          </el-card>

          <el-card class="filter-card">
            <template #header><span>风格条件筛选</span></template>
            <div class="filter-row">
              <span class="filter-label">朝代</span>
              <el-select v-model="filterDynasty" size="small" clearable placeholder="全部" @change="applyFilters">
                <el-option v-for="d in dynastyOptions" :key="d" :label="d" :value="d" />
              </el-select>
            </div>
            <div class="filter-row">
              <span class="filter-label">地域</span>
              <el-select v-model="filterRegion" size="small" clearable placeholder="全部" @change="applyFilters">
                <el-option v-for="r in regionOptions" :key="r" :label="r" :value="r" />
              </el-select>
            </div>
          </el-card>

          <el-card class="similar-card">
            <template #header>
              <div class="similar-header">
                <span>Top-N 相似建筑</span>
                <el-radio-group v-model="topN" size="small" @change="applyFilters">
                  <el-radio-button :value="5">Top 5</el-radio-button>
                  <el-radio-button :value="10">Top 10</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div v-if="!selectedId" class="no-select">点击左侧图中任一点查看相似建筑</div>
            <div v-else class="similar-list">
              <div
                v-for="(item, i) in similarList"
                :key="item.id"
                class="similar-item"
                @click="selectPoint(item.id)"
              >
                <div class="similar-thumb">
                  <img :src="item.url" alt="" />
                  <span class="similarity-badge">{{ item.similarity }}%</span>
                </div>
                <div class="similar-detail">
                  <p class="sim-type">{{ item.result?.buildingType?.name }}</p>
                  <div class="sim-tags">
                    <el-tag v-for="t in item.tags" :key="t" size="small">{{ t }}</el-tag>
                  </div>
                  <p class="sim-explanation">{{ item.explanation }}</p>
                  <el-button size="small" type="primary" text @click.stop="addToCompare(item.id)">加入对比</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Location } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { useArchitectureStore } from '@/stores/architectureStore'
import { computeEmbedding, getTopSimilar } from '@/services/similarityService'

const router = useRouter()
const store = useArchitectureStore()
const chartRef = ref(null)
const selectedId = ref(null)
const colorBy = ref('type')
const topN = ref(5)
const filterDynasty = ref('')
const filterRegion = ref('')
let chart = null

const points = computed(() => computeEmbedding(store.images))

const dynastyOptions = computed(() => {
  const set = new Set()
  store.images.forEach(img => {
    const d = img.result?.styles?.dynasty?.name
    if (d) set.add(d)
  })
  return [...set]
})

const regionOptions = computed(() => {
  const set = new Set()
  store.images.forEach(img => {
    const r = img.result?.styles?.region?.name
    if (r) set.add(r)
  })
  return [...set]
})

const similarList = computed(() => {
  if (!selectedId.value) return []
  return getTopSimilar(selectedId.value, points.value, topN.value, {
    dynasty: filterDynasty.value || undefined,
    region: filterRegion.value || undefined
  })
})

function getColorForPoint(p) {
  const r = p.result
  const by = colorBy.value
  const colors = {
    type: ['#8b4513', '#a0522d', '#cd853f', '#deb887', '#d2b48c'],
    dynasty: ['#2e7d32', '#1565c0', '#c62828', '#6a1b9a'],
    region: ['#5d4037', '#00796b', '#d84315', '#4527a0']
  }
  const pal = colors[by] || colors.type
  let idx = 0
  if (by === 'type') idx = ['宫殿建筑', '宗教建筑', '民居建筑', '园林建筑', '防御建筑'].indexOf(r?.buildingType?.name) % 5
  else if (by === 'dynasty') idx = ['唐代风格', '宋代风格', '明代风格', '清代风格'].indexOf(r?.styles?.dynasty?.name) % 4
  else if (by === 'region') idx = ['北方官式建筑', '江南水乡建筑', '闽南建筑', '藏式建筑'].indexOf(r?.styles?.region?.name) % 4
  return pal[Math.max(0, idx)]
}

function buildChartData() {
  const selected = selectedId.value
  const similarIds = new Set(similarList.value.map(s => s.id))
  return points.value.map(p => ({
    value: [p.x, p.y],
    id: p.id,
    name: p.result?.buildingType?.name || '未识别',
    itemStyle: {
      color: similarIds.has(p.id) ? '#c9a227' : (p.id === selected ? '#c62828' : getColorForPoint(p)),
      borderColor: p.id === selected ? '#fff' : 'transparent',
      borderWidth: p.id === selected ? 3 : 0,
      shadowBlur: p.id === selected ? 10 : 0
    },
    symbolSize: p.id === selected ? 28 : (similarIds.has(p.id) ? 20 : 14)
  }))
}

function updateChart() {
  if (!chart || !points.value.length) return
  chart.setOption({
    series: [{ data: buildChartData() }]
  })
}

function initChart() {
  if (!chartRef.value || !points.value.length) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
  chart.on('click', (e) => {
    if (e.componentType === 'series' && e.data?.id) {
      selectedId.value = e.data.id
    }
  })
  chart.setOption({
    tooltip: {
      formatter: (p) => {
        const d = points.value.find(x => x.id === p.data.id)
        return `${d?.result?.buildingType?.name || '-'}<br/>${d?.result?.styles?.region?.name || '-'} · ${d?.result?.styles?.dynasty?.name || '-'}`
      }
    },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'value', name: '风格维度 1', splitLine: { show: false } },
    yAxis: { type: 'value', name: '风格维度 2', splitLine: { show: false } },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, start: 0, end: 100 },
      { type: 'inside', yAxisIndex: 0, start: 0, end: 100 },
      { type: 'slider', xAxisIndex: 0, bottom: 5 },
      { type: 'slider', yAxisIndex: 0, left: 5 }
    ],
    series: [{
      type: 'scatter',
      data: buildChartData(),
      symbolSize: 14,
      emphasis: { scale: 1.2 }
    }]
  })
}

function selectPoint(id) {
  selectedId.value = id
  updateChart()
}

function applyFilters() {
  updateChart()
}

function addToCompare(id) {
  store.addToCompare(id)
  ElMessage.success('已加入对比列表')
  router.push('/compare')
}

const handleResize = () => chart?.resize()

watch([selectedId, similarList], () => updateChart(), { deep: true })
watch(() => store.images, () => {
  if (points.value.length) {
    if (!selectedId.value) selectedId.value = points.value[0]?.id
    initChart()
  }
}, { deep: true })

onMounted(() => {
  if (points.value.length) {
    selectedId.value = selectedId.value || points.value[0]?.id
    initChart()
    window.addEventListener('resize', handleResize)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<style lang="scss" scoped>
.similarity-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .hint {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
}

.chart-area {
  min-height: 500px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-controls {
  :deep(.el-radio-button__inner) {
    font-size: 0.8rem;
  }
}

.embedding-chart {
  height: 480px;
}

.chart-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.selected-preview {
  display: flex;
  gap: 1rem;

  img {
    width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
  }
}

.selected-info {
  flex: 1;

  .type {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .style {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  .filter-label {
    width: 48px;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .el-select {
    flex: 1;
  }
}

.similar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-select {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.similar-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.similar-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(139, 69, 19, 0.06);
  }
}

.similar-thumb {
  position: relative;
  flex-shrink: 0;

  img {
    width: 70px;
    height: 52px;
    object-fit: cover;
    border-radius: 6px;
  }
}

.similarity-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: var(--accent-primary);
  color: #fff;
  font-size: 0.7rem;
  padding: 1px 4px;
  border-radius: 4px;
}

.similar-detail {
  flex: 1;
  min-width: 0;

  .sim-type {
    font-weight: 500;
    font-size: 0.95rem;
    margin-bottom: 0.35rem;
  }

  .sim-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-bottom: 0.35rem;
  }

  .sim-explanation {
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.4;
    margin-bottom: 0.35rem;
  }
}

@media (max-width: 1000px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}
</style>
