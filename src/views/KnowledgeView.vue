<template>
  <div class="knowledge-view">
    <h1 class="page-title">建筑文化知识图谱</h1>

    <!-- 统计概览 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="num">{{ filteredNodes.filter(n => n.type === 'building').length }}</span>
        <span class="label">建筑类型</span>
      </div>
      <div class="stat-item">
        <span class="num">{{ filteredNodes.filter(n => n.type === 'dynasty').length }}</span>
        <span class="label">朝代</span>
      </div>
      <div class="stat-item">
        <span class="num">{{ filteredNodes.filter(n => n.type === 'region').length }}</span>
        <span class="label">地域风格</span>
      </div>
      <div class="stat-item">
        <span class="num">{{ filteredNodes.filter(n => n.type === 'culture').length }}</span>
        <span class="label">文化属性</span>
      </div>
      <div class="stat-item">
        <span class="num">{{ filteredNodes.filter(n => n.type === 'component').length }}</span>
        <span class="label">典型构件</span>
      </div>
      <div class="stat-item">
        <span class="num">{{ filteredNodes.filter(n => n.type === 'pattern').length }}</span>
        <span class="label">装饰纹样</span>
      </div>
      <div class="stat-item">
        <span class="num">{{ filteredNodes.filter(n => n.type === 'landmark').length }}</span>
        <span class="label">典型建筑</span>
      </div>
    </div>

    <!-- 类型筛选 -->
    <div class="filter-tabs">
      <button
        v-for="opt in filterOptions"
        :key="opt.value"
        class="filter-btn"
        :class="{ active: typeFilter === opt.value }"
        @click="typeFilter = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <div class="knowledge-layout">
      <div class="graph-area">
        <div class="graph-container" ref="graphRef">
          <svg viewBox="0 0 750 450" class="graph-svg">
            <!-- 边（带标签） -->
            <g v-for="(edge, i) in visibleEdges" :key="'e-'+i">
              <line
                :x1="getNode(edge.source)?.x"
                :y1="getNode(edge.source)?.y"
                :x2="getNode(edge.target)?.x"
                :y2="getNode(edge.target)?.y"
                class="edge"
              />
              <text
                v-if="showEdgeLabels"
                :x="(getNode(edge.source)?.x + getNode(edge.target)?.x) / 2"
                :y="(getNode(edge.source)?.y + getNode(edge.target)?.y) / 2"
                text-anchor="middle"
                class="edge-label"
              >{{ edge.label }}</text>
            </g>
            <!-- 节点 -->
            <g
              v-for="node in filteredNodes"
              :key="node.id"
              class="node-g"
              @click="selectedNode = node"
            >
              <circle
                :cx="node.x"
                :cy="node.y"
                :r="getNodeRadius(node)"
                :class="['node', node.type, { active: selectedNode?.id === node.id }]"
              />
              <text
                :x="node.x"
                :y="node.y + 4"
                text-anchor="middle"
                class="node-label"
              >{{ node.name }}</text>
            </g>
          </svg>
        </div>
        <div class="graph-legend">
          <span v-for="t in typeLabels" :key="t.type" class="legend-dot" :class="t.type">{{ t.label }}</span>
        </div>
      </div>

      <aside class="detail-panel">
        <div v-if="selectedNode" class="node-detail">
          <h3>{{ selectedNode.name }}</h3>
          <p class="type">{{ typeLabels.find(t => t.type === selectedNode.type)?.label }}</p>

          <!-- 通用：简介 -->
          <div v-if="getDetail(selectedNode.id)?.desc" class="detail-section">
            <h4>简介</h4>
            <p>{{ getDetail(selectedNode.id).desc }}</p>
          </div>

          <!-- 建筑类型：特征、时期、相关术语 -->
          <template v-if="selectedNode.type === 'building'">
            <div v-if="getDetail(selectedNode.id)?.features?.length" class="detail-section">
              <h4>典型特征</h4>
              <div class="tag-list">
                <span v-for="f in getDetail(selectedNode.id).features" :key="f" class="tag">{{ f }}</span>
              </div>
            </div>
            <div v-if="getDetail(selectedNode.id)?.period" class="detail-section">
              <h4>兴盛时期</h4>
              <p>{{ getDetail(selectedNode.id).period }}</p>
            </div>
            <div v-if="similarBuildings[selectedNode.id]?.length" class="detail-section">
              <h4>相似建筑推荐</h4>
              <div v-for="(s, i) in similarBuildings[selectedNode.id]" :key="i" class="similar-item">
                <strong>{{ s.name }}</strong>
                <span class="style">{{ s.style }}</span>
                <p>{{ s.desc }}</p>
              </div>
            </div>
          </template>

          <!-- 朝代：年代、特征 -->
          <template v-if="selectedNode.type === 'dynasty'">
            <div v-if="getDetail(selectedNode.id)?.period" class="detail-section">
              <h4>年代</h4>
              <p>{{ getDetail(selectedNode.id).period }}</p>
            </div>
            <div v-if="getDetail(selectedNode.id)?.features?.length" class="detail-section">
              <h4>建筑特征</h4>
              <div class="tag-list">
                <span v-for="f in getDetail(selectedNode.id).features" :key="f" class="tag">{{ f }}</span>
              </div>
            </div>
          </template>

          <!-- 地域：范围 -->
          <template v-if="selectedNode.type === 'region'">
            <div v-if="getDetail(selectedNode.id)?.scope" class="detail-section">
              <h4>地域范围</h4>
              <p>{{ getDetail(selectedNode.id).scope }}</p>
            </div>
          </template>

          <!-- 构件/纹样：用途、演变 -->
          <template v-if="['component', 'pattern'].includes(selectedNode.type)">
            <div v-if="getDetail(selectedNode.id)?.usage" class="detail-section">
              <h4>应用场景</h4>
              <p>{{ getDetail(selectedNode.id).usage }}</p>
            </div>
            <div v-if="getDetail(selectedNode.id)?.evolution" class="detail-section">
              <h4>形制演变</h4>
              <p>{{ getDetail(selectedNode.id).evolution }}</p>
            </div>
            <div v-if="getDetail(selectedNode.id)?.meaning" class="detail-section">
              <h4>文化寓意</h4>
              <p>{{ getDetail(selectedNode.id).meaning }}</p>
            </div>
          </template>

          <!-- 典型建筑：位置、建造年代、亮点 -->
          <template v-if="selectedNode.type === 'landmark'">
            <div v-if="getDetail(selectedNode.id)?.location" class="detail-section">
              <h4>所在地</h4>
              <p>{{ getDetail(selectedNode.id).location }}</p>
            </div>
            <div v-if="getDetail(selectedNode.id)?.built" class="detail-section">
              <h4>建造年代</h4>
              <p>{{ getDetail(selectedNode.id).built }}</p>
            </div>
            <div v-if="getDetail(selectedNode.id)?.highlight" class="detail-section">
              <h4>建筑亮点</h4>
              <p>{{ getDetail(selectedNode.id).highlight }}</p>
            </div>
          </template>

          <!-- 相关术语（通用） -->
          <div v-if="getDetail(selectedNode.id)?.relatedTerms?.length" class="detail-section">
            <h4>相关术语</h4>
            <div class="tag-list">
              <span v-for="t in getDetail(selectedNode.id).relatedTerms" :key="t" class="tag">{{ t }}</span>
            </div>
          </div>

          <!-- 关联节点 -->
          <div class="detail-section related-nodes">
            <h4>关联节点</h4>
            <div class="related-list">
              <span
                v-for="rel in relatedNodes"
                :key="rel.id"
                class="related-chip"
                @click="selectedNode = rel"
              >{{ rel.name }}</span>
            </div>
          </div>
        </div>
        <div v-else class="hint">
          <p>点击图中节点查看详情</p>
          <p>建筑—朝代—地域—文化—构件—纹样 关系网络</p>
          <p class="tip">支持按类型筛选，点击节点查看详情</p>
        </div>
      </aside>
    </div>

    <!-- 朝代年表 -->
    <div class="timeline-section">
      <h3>朝代年表</h3>
      <div class="dynasty-timeline">
        <div
          v-for="d in dynastyTimeline"
          :key="d.id"
          class="timeline-block"
          :style="{ '--color': d.color }"
          @click="selectDynastyNode(d.id)"
        >
          <span class="dynasty-name">{{ d.name }}</span>
          <span class="dynasty-years">{{ d.start }}–{{ d.end }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  knowledgeNodes,
  knowledgeEdges,
  nodeDetails,
  similarBuildings,
  dynastyTimeline
} from '@/data/knowledgeGraph'

const graphRef = ref(null)
const selectedNode = ref(null)
const typeFilter = ref('all')
const showEdgeLabels = ref(true)

const typeLabels = [
  { type: 'building', label: '建筑类型' },
  { type: 'dynasty', label: '朝代' },
  { type: 'region', label: '地域风格' },
  { type: 'culture', label: '文化属性' },
  { type: 'component', label: '典型构件' },
  { type: 'pattern', label: '装饰纹样' },
  { type: 'landmark', label: '典型建筑' }
]

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'building', label: '建筑类型' },
  { value: 'dynasty', label: '朝代' },
  { value: 'region', label: '地域风格' },
  { value: 'culture', label: '文化属性' },
  { value: 'component', label: '构件纹样' },
  { value: 'landmark', label: '典型建筑' }
]

const filteredNodes = computed(() => {
  if (typeFilter.value === 'all') return knowledgeNodes
  if (typeFilter.value === 'component') {
    return knowledgeNodes.filter(n => n.type === 'component' || n.type === 'pattern')
  }
  return knowledgeNodes.filter(n => n.type === typeFilter.value)
})

const visibleEdges = computed(() => {
  const ids = new Set(filteredNodes.value.map(n => n.id))
  return knowledgeEdges.filter(e => ids.has(e.source) && ids.has(e.target))
})

const relatedNodes = computed(() => {
  if (!selectedNode.value) return []
  const edges = knowledgeEdges.filter(
    e => e.source === selectedNode.value.id || e.target === selectedNode.value.id
  )
  const ids = new Set()
  edges.forEach(e => {
    if (e.source !== selectedNode.value.id) ids.add(e.source)
    if (e.target !== selectedNode.value.id) ids.add(e.target)
  })
  return knowledgeNodes.filter(n => ids.has(n.id))
})

function getNode(id) {
  return knowledgeNodes.find(n => n.id === id)
}

function getDetail(id) {
  return nodeDetails[id] || {}
}

function getNodeRadius(node) {
  if (node.type === 'building' || node.type === 'landmark') return 26
  if (node.type === 'dynasty') return 24
  return 20
}

function selectDynastyNode(id) {
  const node = knowledgeNodes.find(n => n.id === id)
  if (node) selectedNode.value = node
}
</script>

<style lang="scss" scoped>
.knowledge-view {
  max-width: 1300px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.stats-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;

  .num {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--accent-primary);
  }

  .label {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-btn {
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
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

.knowledge-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 1.5rem;
}

.graph-area {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.graph-container {
  width: 100%;
  min-height: 420px;
}

.graph-svg {
  width: 100%;
  height: auto;
}

.edge {
  stroke: var(--border-color);
  stroke-width: 2;
  opacity: 0.7;
}

.edge-label {
  font-size: 10px;
  fill: var(--text-secondary);
  pointer-events: none;
}

.node {
  fill: var(--bg-secondary);
  stroke: var(--accent-primary);
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.2s;

  &:hover,
  &.active {
    fill: rgba(139, 69, 19, 0.2);
    stroke-width: 3;
  }

  &.building {
    fill: rgba(139, 69, 19, 0.25);
  }

  &.dynasty {
    fill: rgba(201, 162, 39, 0.25);
  }

  &.region {
    fill: rgba(160, 82, 45, 0.2);
  }

  &.culture {
    fill: rgba(101, 67, 33, 0.2);
  }

  &.component {
    fill: rgba(139, 90, 43, 0.2);
  }

  &.pattern {
    fill: rgba(205, 133, 63, 0.2);
  }

  &.landmark {
    fill: rgba(139, 69, 19, 0.3);
    stroke: var(--accent-gold);
  }
}

.node-label {
  font-size: 11px;
  fill: var(--text-primary);
  pointer-events: none;
}

.graph-legend {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem 1rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.legend-dot {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &.building::before { background: rgba(139, 69, 19, 0.5); }
  &.dynasty::before { background: rgba(201, 162, 39, 0.5); }
  &.region::before { background: rgba(160, 82, 45, 0.5); }
  &.culture::before { background: rgba(101, 67, 33, 0.5); }
  &.component::before { background: rgba(139, 90, 43, 0.5); }
  &.pattern::before { background: rgba(205, 133, 63, 0.5); }
  &.landmark::before { background: var(--accent-gold); }
}

.detail-panel {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  height: fit-content;
  max-height: 600px;
  overflow-y: auto;
}

.node-detail h3 {
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.type {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.detail-section {
  margin-bottom: 1rem;

  h4 {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.4rem;
  }

  p {
    font-size: 0.9rem;
    color: var(--text-primary);
    line-height: 1.5;
    margin: 0;
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  padding: 0.2rem 0.5rem;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 6px;
  font-size: 0.85rem;
}

.similar-item {
  padding: 0.75rem;
  background: rgba(139, 69, 19, 0.05);
  border-radius: 8px;
  margin-bottom: 0.5rem;

  strong {
    display: block;
    margin-bottom: 0.25rem;
  }

  .style {
    font-size: 0.85rem;
    color: var(--accent-primary);
  }

  p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }
}

.related-nodes .related-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.related-chip {
  padding: 0.3rem 0.6rem;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(139, 69, 19, 0.2);
  }
}

.hint {
  color: var(--text-secondary);
  text-align: center;
  padding: 2rem 0;

  p {
    margin-bottom: 0.5rem;
  }

  .tip {
    font-size: 0.85rem;
    opacity: 0.8;
  }
}

.timeline-section {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);

  h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
}

.dynasty-timeline {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.timeline-block {
  flex: 1;
  min-width: 140px;
  padding: 0.75rem 1rem;
  background: rgba(139, 69, 19, 0.08);
  border-left: 4px solid var(--color);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(139, 69, 19, 0.15);
  }

  .dynasty-name {
    display: block;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .dynasty-years {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
}

@media (max-width: 1000px) {
  .knowledge-layout {
    grid-template-columns: 1fr;
  }
}
</style>
