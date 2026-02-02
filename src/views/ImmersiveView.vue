<template>
  <div class="immersive-view" :class="{ fullscreen: isFullscreen }">
    <header class="immersive-header">
      <el-button text @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <span class="title">{{ item?.result?.buildingType?.name }} · {{ item?.result?.styles?.region?.name }}</span>
      <el-button text @click="isFullscreen = !isFullscreen">
        <el-icon><FullScreen /></el-icon>
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </el-button>
    </header>

    <div v-if="!item" class="empty">
      <p>未找到该建筑数据</p>
      <el-button @click="$router.push('/recognize')">前往识别</el-button>
    </div>

    <template v-else>
      <div class="immersive-content">
        <div class="image-full" ref="imgContainerRef">
          <img :src="item.url" alt="" />
          <div
            v-for="(comp, i) in item.result?.components"
            :key="i"
            class="hotspot"
            :style="getHotspotStyle(comp)"
            @click="openPopup(comp)"
          >
            <span class="hotspot-dot"></span>
          </div>
        </div>

        <aside class="info-panel">
          <ResultCard :result="item.result" @update="onResultUpdate" />
        </aside>
      </div>

      <el-dialog
        v-model="dialogVisible"
        :title="popupContent?.name"
        width="400px"
        destroy-on-close
        @close="popupContent = null"
      >
        <template v-if="popupContent">
          <p>{{ popupContent.desc }}</p>
          <p class="conf">置信度：{{ Math.round((popupContent.confidence || 0) * 100) }}%</p>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, FullScreen } from '@element-plus/icons-vue'
import ResultCard from '@/components/ResultCard.vue'
import { useArchitectureStore } from '@/stores/architectureStore'

const route = useRoute()
const store = useArchitectureStore()

const isFullscreen = ref(false)
const dialogVisible = ref(false)
const popupContent = ref(null)
const imgContainerRef = ref(null)

function openPopup(comp) {
  popupContent.value = comp
  dialogVisible.value = true
}

function onResultUpdate(updates) {
  const id = route.params.id
  if (id) store.updateImageResult(id, updates)
}

const item = computed(() => {
  const id = route.params.id
  return id ? store.getImageById(id) : store.images[0]
})

function getHotspotStyle(comp) {
  if (!comp.bbox) return {}
  return {
    left: (comp.bbox.x * 100) + '%',
    top: (comp.bbox.y * 100) + '%',
    width: (comp.bbox.width * 100) + '%',
    height: (comp.bbox.height * 100) + '%'
  }
}

onMounted(() => {
  document.body.classList.add('immersive-body')
  return () => document.body.classList.remove('immersive-body')
})
</script>

<style lang="scss" scoped>
.immersive-view {
  min-height: 100vh;
  background: #1a1a1a;
  color: #f5f0e8;
}

.immersive-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

.immersive-header .title {
  font-size: 1.1rem;
}

.immersive-content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 0;
  padding-top: 56px;
  min-height: 100vh;
}

.image-full {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: calc(100vh - 56px);

  img {
    max-width: 100%;
    max-height: calc(100vh - 120px);
    object-fit: contain;
  }
}

.hotspot {
  position: absolute;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  .hotspot-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(201, 162, 39, 0.9);
    border: 2px solid #fff;
    box-shadow: 0 0 8px rgba(0,0,0,0.5);
  }

  &:hover .hotspot-dot {
    transform: scale(1.2);
  }
}

.info-panel {
  width: 360px;
  background: rgba(30, 30, 30, 0.95);
  padding: 1.5rem;
  overflow-y: auto;
}

.info-panel :deep(.result-card) {
  background: transparent;
  border-color: rgba(255,255,255,0.1);
}

.info-panel :deep(.card-title),
.info-panel :deep(h4),
.info-panel :deep(.name) {
  color: #f5f0e8;
}

.info-panel :deep(.desc),
.info-panel :deep(.label),
.info-panel :deep(.region) {
  color: rgba(245, 240, 232, 0.8);
}

.empty {
  padding: 4rem;
  text-align: center;
}

.fullscreen .immersive-header {
  position: absolute;
}

.conf {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
