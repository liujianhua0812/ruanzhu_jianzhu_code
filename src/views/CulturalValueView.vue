<template>
  <div class="cultural-value-view">
    <h1 class="page-title">建筑文化价值评估与保护建议</h1>

    <div v-if="!store.images.length" class="empty-state">
      <el-icon class="empty-icon"><Document /></el-icon>
      <p>暂无已识别的建筑数据</p>
      <p class="hint">请先在「建筑识别」页面上传建筑图片完成识别</p>
      <el-button type="primary" @click="$router.push('/recognize')">前往识别</el-button>
    </div>

    <template v-else>
      <!-- 建筑选择 -->
      <section class="section-select">
        <h3>选择建筑进行评估</h3>
        <div class="building-cards">
          <div
            v-for="item in store.images"
            :key="item.id"
            class="building-card"
            :class="{ active: selectedId === item.id }"
            @click="selectedId = item.id"
          >
            <img :src="item.url" alt="" />
            <span class="label">{{ item.result?.buildingType?.name || '未识别' }}</span>
          </div>
        </div>
      </section>

      <div v-if="selectedId" class="content-grid">
        <!-- 左侧：雷达图 + 等级 -->
        <div class="left-panel">
          <el-card class="radar-card">
            <template #header>
              <span>文化价值雷达图</span>
            </template>
            <div ref="radarChartRef" class="radar-chart"></div>
            <div class="value-level">
              <span class="label">文化价值等级：</span>
              <span class="stars">{{ starDisplay }}</span>
            </div>
          </el-card>
        </div>

        <!-- 右侧：对比排名 + 保护建议（可编辑） -->
        <div class="right-panel">
          <el-card class="rank-card">
            <template #header>
              <span>同类建筑对比排名</span>
            </template>
            <div v-if="ranking" class="rank-content">
              <div class="rank-badge">
                第 <strong
                  v-if="editing !== 'rank'"
                  class="editable"
                  @dblclick="startEdit('rank', String(editedRank.rank))"
                >{{ editedRank.rank }}</strong>
                <input
                  v-else
                  ref="editInputRef"
                  type="text"
                  class="edit-inline"
                  :value="editValue"
                  @input="editValue = $event.target.value"
                  @blur="commitRankEdit"
                  @keydown.enter.prevent="commitRankEdit"
                  @keydown.esc="cancelEdit"
                />
                / <strong
                  v-if="editing !== 'total'"
                  class="editable"
                  @dblclick="startEdit('total', String(editedRank.total))"
                >{{ editedRank.total }}</strong>
                <input
                  v-else
                  ref="editInputRef"
                  type="text"
                  class="edit-inline"
                  :value="editValue"
                  @input="editValue = $event.target.value"
                  @blur="commitTotalEdit"
                  @keydown.enter.prevent="commitTotalEdit"
                  @keydown.esc="cancelEdit"
                />
                名
              </div>
              <div v-if="editedDifferences.length || ranking.differences.length" class="differences">
                <h4>差异点说明</h4>
                <ul>
                  <li v-for="(d, i) in editedDifferences" :key="i">
                    <span
                      v-if="editing !== `diff_${i}`"
                      class="editable"
                      @dblclick="startEdit(`diff_${i}`, d, i)"
                    >{{ d }}</span>
                    <input
                      v-else
                      ref="editInputRef"
                      type="text"
                      class="edit-inline full"
                      :value="editValue"
                      @input="editValue = $event.target.value"
                      @blur="commitDiffEdit(i)"
                      @keydown.enter.prevent="commitDiffEdit(i)"
                      @keydown.esc="cancelEdit"
                    />
                  </li>
                </ul>
              </div>
              <p v-else class="no-diff">当前为同类建筑中唯一或排名第一</p>
            </div>
          </el-card>

          <el-card class="suggest-card">
            <template #header>
              <span>AI 保护建议</span>
            </template>
            <div v-if="suggestions" class="suggest-content">
              <div class="suggest-item">
                <h4>建议保护等级</h4>
                <span
                  v-if="editing !== 'protectionLevel'"
                  class="editable tag-like"
                  @dblclick="startEdit('protectionLevel', editedProtectionLevel)"
                >{{ editedProtectionLevel }}</span>
                <input
                  v-else
                  ref="editInputRef"
                  type="text"
                  class="edit-inline"
                  :value="editValue"
                  @input="editValue = $event.target.value"
                  @blur="commitProtectionEdit"
                  @keydown.enter.prevent="commitProtectionEdit"
                  @keydown.esc="cancelEdit"
                />
              </div>
              <div class="suggest-item">
                <h4>推荐修缮重点构件</h4>
                <ul>
                  <li v-for="(c, i) in editedKeyComponents" :key="i">
                    <span
                      v-if="editing !== `comp_${i}`"
                      class="editable"
                      @dblclick="startEdit(`comp_${i}`, c, i)"
                    >{{ c }}</span>
                    <input
                      v-else
                      ref="editInputRef"
                      type="text"
                      class="edit-inline full"
                      :value="editValue"
                      @input="editValue = $event.target.value"
                      @blur="commitCompEdit(i)"
                      @keydown.enter.prevent="commitCompEdit(i)"
                      @keydown.esc="cancelEdit"
                    />
                  </li>
                </ul>
              </div>
              <div class="suggest-item">
                <h4>风格保持建议</h4>
                <ul>
                  <li v-for="(a, i) in editedStyleAdvice" :key="i">
                    <span
                      v-if="editing !== `advice_${i}`"
                      class="editable"
                      @dblclick="startEdit(`advice_${i}`, a, i)"
                    >{{ a }}</span>
                    <input
                      v-else
                      ref="editInputRef"
                      type="text"
                      class="edit-inline full"
                      :value="editValue"
                      @input="editValue = $event.target.value"
                      @blur="commitAdviceEdit(i)"
                      @keydown.enter.prevent="commitAdviceEdit(i)"
                      @keydown.esc="cancelEdit"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 导出按钮 -->
      <div v-if="selectedId" class="export-area">
        <el-button type="primary" :loading="exporting" @click="exportPDF">
          <el-icon><Download /></el-icon>
          导出评估报告（PDF）
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Document, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useArchitectureStore } from '@/stores/architectureStore'
import {
  evaluateCulturalValue,
  getSimilarRanking,
  getProtectionSuggestions
} from '@/services/culturalValueService'

const store = useArchitectureStore()
const selectedId = ref(store.images[0]?.id || null)
const radarChartRef = ref(null)
const exporting = ref(false)
let radarChart = null

// 可编辑的右侧内容（导出时使用这些值）
const editedRank = ref({ rank: 1, total: 1 })
const editedDifferences = ref([])
const editedProtectionLevel = ref('')
const editedKeyComponents = ref([])
const editedStyleAdvice = ref([])

const editing = ref(null)
const editValue = ref('')
const editMeta = ref(null)
const editInputRef = ref(null)

const selectedImage = computed(() =>
  selectedId.value ? store.getImageById(selectedId.value) : null
)

const evaluation = computed(() => {
  const r = selectedImage.value?.result
  return r ? evaluateCulturalValue(r) : null
})

const ranking = computed(() => {
  if (!selectedId.value) return null
  return getSimilarRanking(selectedId.value, store.images)
})

const suggestions = computed(() => {
  const r = selectedImage.value?.result
  return r ? getProtectionSuggestions(r, evaluation.value) : null
})

// 文化价值等级严格按雷达图综合平均分评定
const starDisplay = computed(() => {
  const n = evaluation.value?.level ?? 0
  return '★'.repeat(n) + '☆'.repeat(5 - n)
})

// 切换建筑时同步可编辑内容
watch([selectedId, ranking, suggestions], () => {
  if (ranking.value) {
    editedRank.value = { rank: ranking.value.rank, total: ranking.value.total }
    editedDifferences.value = [...(ranking.value.differences || [])]
  }
  if (suggestions.value) {
    editedProtectionLevel.value = suggestions.value.protectionLevel
    editedKeyComponents.value = [...(suggestions.value.keyComponents || [])]
    editedStyleAdvice.value = [...(suggestions.value.styleAdvice || [])]
  }
}, { immediate: true, deep: true })

function startEdit(field, val, meta) {
  editing.value = field
  editValue.value = typeof val === 'string' ? val : String(val)
  editMeta.value = meta
  nextTick(() => editInputRef.value?.focus?.())
}

function cancelEdit() {
  editing.value = null
  editValue.value = ''
  editMeta.value = null
}

function commitRankEdit() {
  const n = parseInt(editValue.value, 10)
  if (!isNaN(n) && n >= 1) editedRank.value = { ...editedRank.value, rank: n }
  cancelEdit()
}

function commitTotalEdit() {
  const n = parseInt(editValue.value, 10)
  if (!isNaN(n) && n >= 1) editedRank.value = { ...editedRank.value, total: n }
  cancelEdit()
}

function commitDiffEdit(i) {
  const v = editValue.value?.trim()
  if (v !== undefined) {
    const arr = [...editedDifferences.value]
    arr[i] = v
    editedDifferences.value = arr
  }
  cancelEdit()
}

function commitProtectionEdit() {
  const v = editValue.value?.trim()
  if (v !== undefined) editedProtectionLevel.value = v || editedProtectionLevel.value
  cancelEdit()
}

function commitCompEdit(i) {
  const v = editValue.value?.trim()
  if (v !== undefined) {
    const arr = [...editedKeyComponents.value]
    arr[i] = v
    editedKeyComponents.value = arr
  }
  cancelEdit()
}

function commitAdviceEdit(i) {
  const v = editValue.value?.trim()
  if (v !== undefined) {
    const arr = [...editedStyleAdvice.value]
    arr[i] = v
    editedStyleAdvice.value = arr
  }
  cancelEdit()
}

function initRadarChart() {
  if (!radarChartRef.value || !evaluation.value) return
  if (radarChart) radarChart.dispose()
  radarChart = echarts.init(radarChartRef.value)

  const { scores } = evaluation.value
  const option = {
    radar: {
      indicator: [
        { name: '历史价值', max: 100 },
        { name: '稀缺性', max: 100 },
        { name: '完整性', max: 100 },
        { name: '代表性', max: 100 },
        { name: '地域独特性', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#5c4a3d' },
      splitArea: { areaStyle: { color: ['rgba(139,69,19,0.05)', 'rgba(139,69,19,0.1)'] } },
      axisLine: { lineStyle: { color: '#d4c4a8' } },
      splitLine: { lineStyle: { color: '#d4c4a8' } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          scores.history,
          scores.scarcity,
          scores.integrity,
          scores.representativeness,
          scores.regional
        ],
        name: '文化价值',
        areaStyle: { color: 'rgba(139, 69, 19, 0.3)' },
        lineStyle: { color: '#8b4513', width: 2 },
        itemStyle: { color: '#8b4513' }
      }]
    }]
  }
  radarChart.setOption(option)
}

watch([selectedId, evaluation], () => initRadarChart(), { deep: true })

watch(selectedId, (v) => {
  if (v && !store.images.find(i => i.id === v)) {
    selectedId.value = store.images[0]?.id || null
  }
})

const handleResize = () => radarChart?.resize()
onMounted(() => {
  if (store.images.length && !selectedId.value) {
    selectedId.value = store.images[0].id
  }
  initRadarChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  radarChart?.dispose()
})

async function exportPDF() {
  if (!selectedImage.value || !evaluation.value) return
  exporting.value = true
  try {
    const img = selectedImage.value
    const r = img.result
    const ev = evaluation.value

    // 使用编辑后的内容导出
    const rank = editedRank.value
    const diffs = editedDifferences.value
    const protectionLevel = editedProtectionLevel.value
    const keyComponents = editedKeyComponents.value
    const styleAdvice = editedStyleAdvice.value

    const chartDataUrl = radarChart ? radarChart.getDataURL({ type: 'png', pixelRatio: 2 }) : ''

    const diffsHtml = diffs.length ? diffs.map(d => `<li>${escapeHtml(d)}</li>`).join('') : ''
    const adviceHtml = styleAdvice.length ? styleAdvice.map(s => `<li>${escapeHtml(s)}</li>`).join('') : '<li>保持原有建筑风格</li>'

    const reportHtml = `
      <div style="font-family: 'Microsoft YaHei', 'SimSun', 'Noto Sans SC', sans-serif; padding: 24px; width: 600px; background: #fff; color: #2c1810;">
        <h1 style="text-align: center; font-size: 20px; margin-bottom: 20px;">建筑文化价值评估报告</h1>
        <p style="font-size: 12px; margin-bottom: 4px;">建筑类型：${escapeHtml(r?.buildingType?.name || '-')}</p>
        <p style="font-size: 12px; margin-bottom: 16px;">地域风格：${escapeHtml(r?.styles?.region?.name || '-')}　朝代风格：${escapeHtml(r?.styles?.dynasty?.name || '-')}</p>
        <h2 style="font-size: 14px; margin: 16px 0 8px;">一、文化价值等级</h2>
        <p style="font-size: 12px;">综合评分：${ev.average} 分　等级：${'★'.repeat(ev.level)}${'☆'.repeat(5 - ev.level)}</p>
        ${chartDataUrl ? `<img src="${chartDataUrl}" style="width: 100%; max-width: 400px; margin: 12px 0; display: block;" />` : ''}
        <h2 style="font-size: 14px; margin: 16px 0 8px;">二、同类建筑对比排名</h2>
        <p style="font-size: 12px;">排名：第 ${rank.rank} / ${rank.total} 名</p>
        ${diffsHtml ? `<ul style="font-size: 12px; margin: 8px 0 0 20px; padding: 0;">${diffsHtml}</ul>` : ''}
        <h2 style="font-size: 14px; margin: 16px 0 8px;">三、AI 保护建议</h2>
        <p style="font-size: 12px;">建议保护等级：<strong>${escapeHtml(protectionLevel)}</strong></p>
        <p style="font-size: 12px;">推荐修缮重点构件：${escapeHtml(keyComponents.length ? keyComponents.join('、') : '-')}</p>
        <p style="font-size: 12px; margin-bottom: 4px;">风格保持建议：</p>
        <ul style="font-size: 12px; margin: 4px 0 0 20px; padding: 0;">${adviceHtml}</ul>
      </div>
    `

    const wrap = document.createElement('div')
    wrap.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 600px; z-index: -1;'
    wrap.innerHTML = reportHtml
    document.body.appendChild(wrap)

    await new Promise(r => setTimeout(r, 100))

    const canvas = await html2canvas(wrap, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })
    document.body.removeChild(wrap)

    const imgData = canvas.toDataURL('image/png')
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    let imgW = pageW
    let imgH = (canvas.height * pageW) / canvas.width
    if (imgH > pageH) {
      imgH = pageH
      imgW = (canvas.width * pageH) / canvas.height
    }
    doc.addImage(imgData, 'PNG', 0, 0, imgW, imgH)
    doc.save(`建筑文化价值评估报告_${r?.buildingType?.name || '建筑'}_${Date.now()}.pdf`)
  } catch (e) {
    console.error(e)
  } finally {
    exporting.value = false
  }
}

function escapeHtml(str) {
  if (str == null) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
</script>

<style lang="scss" scoped>
.cultural-value-view {
  max-width: 1200px;
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

.section-select {
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
  }
}

.building-cards {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.building-card {
  flex-shrink: 0;
  width: 100px;
  height: 75px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  position: relative;

  &:hover,
  &.active {
    border-color: var(--accent-primary);
    box-shadow: var(--shadow-medium);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 0.7rem;
    text-align: center;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 2px 0;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radar-chart {
  height: 280px;
  margin-bottom: 1rem;
}

.value-level {
  text-align: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);

  .label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-right: 0.5rem;
  }

  .stars {
    font-size: 1.4rem;
    color: var(--accent-gold);
  }
}

.rank-badge {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;

  strong {
    color: var(--accent-primary);
    font-size: 1.3rem;
  }
}

.differences h4,
.suggest-item h4 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.differences ul,
.suggest-item ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.no-diff {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.suggest-item {
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.editable {
  cursor: text;
  padding: 2px 4px;
  border-radius: 4px;

  &:hover {
    background: rgba(139, 69, 19, 0.08);
  }
}

.edit-inline {
  font-size: inherit;
  padding: 2px 6px;
  border: 1px solid var(--accent-primary);
  border-radius: 4px;
  min-width: 60px;

  &.full {
    width: 100%;
    min-width: 120px;
  }
}

.tag-like {
  display: inline-block;
  padding: 4px 12px;
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
  border-radius: 4px;
}

.export-area {
  text-align: center;
  padding: 1.5rem;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
