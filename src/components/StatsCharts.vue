<template>
  <div class="stats-charts">
    <h3>识别统计</h3>
    <div class="charts-row">
      <div class="chart-box" ref="typeChartRef"></div>
      <div class="chart-box" ref="styleChartRef"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  typeDistribution: Array,
  styleDistribution: Array
})

const typeChartRef = ref(null)
const styleChartRef = ref(null)
let typeChart = null
let styleChart = null

function initCharts() {
  if (typeChartRef.value) {
    typeChart = echarts.init(typeChartRef.value)
  }
  if (styleChartRef.value) {
    styleChart = echarts.init(styleChartRef.value)
  }
  updateCharts()
}

function updateCharts() {
  const typeData = props.typeDistribution || []
  const styleData = props.styleDistribution || []

  if (typeChart) {
    typeChart.setOption({
      title: { text: '建筑类型分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: typeData.map(d => ({ name: d.name, value: d.value })),
        itemStyle: {
          color: (params) => {
            const colors = ['#8b4513', '#a0522d', '#cd853f', '#deb887', '#d2b48c']
            return colors[params.dataIndex % colors.length]
          }
        }
      }]
    })
  }

  if (styleChart) {
    styleChart.setOption({
      title: { text: '地域风格分布', left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: styleData.map(d => d.name) },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: styleData.map(d => d.value),
        itemStyle: { color: '#c9a227' }
      }]
    })
  }
}

watch(
  () => [props.typeDistribution, props.styleDistribution],
  () => updateCharts(),
  { deep: true }
)

onMounted(() => {
  initCharts()
  window.addEventListener('resize', () => {
    typeChart?.resize()
    styleChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.stats-charts {
  h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.chart-box {
  height: 240px;
  background: var(--bg-card);
  border-radius: 8px;
  padding: 0.5rem;
}

@media (max-width: 768px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>
