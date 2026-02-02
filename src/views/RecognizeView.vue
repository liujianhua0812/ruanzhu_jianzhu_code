<template>
  <div class="recognize-view">
    <h1 class="page-title">建筑识别与标注</h1>

    <div class="layout-main">
      <!-- 左侧：输入区 -->
      <aside class="sidebar-left">
        <el-card class="input-card">
          <template #header>
            <span>多模态数据输入</span>
          </template>

          <el-tabs v-model="activeTab">
            <el-tab-pane label="图像输入" name="image">
              <ImageUploader :disabled="recognizing" @upload="handleImageUpload" />
              <div v-if="qualityInfo" class="quality-info">
                <p>清晰度：{{ qualityInfo.quality }}</p>
                <p>分辨率：{{ qualityInfo.resolution }}</p>
              </div>
            </el-tab-pane>
            <el-tab-pane label="视频输入" name="video">
              <div class="video-placeholder">
                <el-icon><VideoPlay /></el-icon>
                <p>支持航拍/行走拍摄视频，自动提取关键帧</p>
                <el-upload
                  accept="video/*"
                  :show-file-list="false"
                  :before-upload="handleVideoUpload"
                >
                  <el-button size="small">选择视频</el-button>
                </el-upload>
              </div>
            </el-tab-pane>
            <el-tab-pane label="文本输入" name="text">
              <TextInput @extract="onTextExtract" />
            </el-tab-pane>
          </el-tabs>
        </el-card>

        <!-- 标注开关 -->
        <el-card v-if="currentResult" class="switch-card">
          <h4>标注显示</h4>
          <el-switch v-model="showBbox" active-text="建筑边界" />
          <el-switch v-model="showComponents" active-text="构件标注" />
        </el-card>
      </aside>

      <!-- 中间：图像与标注 -->
      <main class="content-main">
        <div v-if="!currentImage" class="empty-state">
          <el-icon class="empty-icon"><Picture /></el-icon>
          <p>请上传建筑图片开始识别</p>
        </div>

        <template v-else>
          <div class="image-gallery">
            <div
              v-for="item in store.images"
              :key="item.id"
              class="gallery-item"
              :class="{ active: currentId === item.id }"
              @click="currentId = item.id"
            >
              <img :src="item.url" alt="" />
              <span class="label">{{ item.result?.buildingType?.name || '识别中' }}</span>
            </div>
          </div>

          <div class="annotator-area">
            <ImageAnnotator
              :image-url="currentImage?.url"
              :result="currentResult"
              :show-bbox="showBbox"
              :show-components="showComponents"
              @update:bbox="onBboxUpdate"
              @update:components="onComponentsUpdate"
            />
          </div>
        </template>
      </main>

      <!-- 右侧：结果卡片 -->
      <aside class="sidebar-right">
        <div v-if="currentResult" class="result-area">
          <ResultCard :result="currentResult" @update="onResultUpdate" />
          <div class="actions">
            <el-button size="small" @click="addToCompare">加入对比</el-button>
            <el-button size="small" type="primary" @click="goImmersive">沉浸式浏览</el-button>
          </div>
        </div>
        <div v-else-if="currentImage" class="loading-area">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>识别中...</p>
        </div>
      </aside>
    </div>

    <!-- 底部统计 -->
    <section v-if="store.images.length" class="stats-section">
      <StatsCharts
        :type-distribution="store.typeDistribution"
        :style-distribution="store.styleDistribution"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, VideoPlay, Loading } from '@element-plus/icons-vue'
import ImageUploader from '@/components/ImageUploader.vue'
import ImageAnnotator from '@/components/ImageAnnotator.vue'
import ResultCard from '@/components/ResultCard.vue'
import TextInput from '@/components/TextInput.vue'
import StatsCharts from '@/components/StatsCharts.vue'
import { useArchitectureStore } from '@/stores/architectureStore'
import { detectImageQuality, recognizeBuilding } from '@/services/recognitionService'

const router = useRouter()
const store = useArchitectureStore()

const activeTab = ref('image')
const currentId = ref(null)
const recognizing = ref(false)
const qualityInfo = ref(null)
const showBbox = ref(true)
const showComponents = ref(true)

const currentImage = computed(() =>
  currentId.value ? store.getImageById(currentId.value) : store.images[0]
)

const currentResult = computed(() => currentImage.value?.result ?? null)

async function handleImageUpload(files) {
  for (const file of files) {
    const url = URL.createObjectURL(file)
    qualityInfo.value = await detectImageQuality(file)
    recognizing.value = true

    try {
      const result = await recognizeBuilding(file, url)
      const id = store.addImageResult({
        url,
        file,
        result,
        quality: qualityInfo.value
      })
      if (!currentId.value) currentId.value = id
      ElMessage.success('识别完成')
    } catch (e) {
      ElMessage.error('识别失败')
    } finally {
      recognizing.value = false
    }
  }
}

function handleVideoUpload(file) {
  ElMessage.info('视频关键帧提取为扩展功能，请使用图像输入')
  return false
}

function onTextExtract(kw) {
  store.extractedKeywords = kw
}

function onBboxUpdate(bbox) {
  if (currentId.value) {
    store.updateImageResult(currentId.value, { bbox })
  }
}

function onComponentsUpdate(components) {
  if (currentId.value) {
    store.updateImageResult(currentId.value, { components })
  }
}

function onResultUpdate(updates) {
  if (currentId.value) {
    store.updateImageResult(currentId.value, updates)
  }
}

function addToCompare() {
  if (currentId.value) {
    store.addToCompare(currentId.value)
    ElMessage.success('已加入对比列表')
  }
}

function goImmersive() {
  if (currentId.value) {
    router.push(`/immersive/${currentId.value}`)
  }
}
</script>

<style lang="scss" scoped>
.recognize-view {
  max-width: 1600px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.layout-main {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 1.5rem;
  align-items: start;
}

.sidebar-left,
.sidebar-right {
  position: sticky;
  top: 80px;
}

.input-card {
  margin-bottom: 1rem;
}

.quality-info {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(139, 69, 19, 0.06);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.video-placeholder {
  text-align: center;
  padding: 1.5rem;
  border: 1px dashed var(--border-color);
  border-radius: 8px;

  .el-icon {
    font-size: 2.5rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
  }
}

.switch-card h4 {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.switch-card .el-switch {
  display: block;
  margin-bottom: 0.5rem;
}

.empty-state {
  grid-column: 2;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
}

.image-gallery {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.gallery-item {
  flex-shrink: 0;
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;

  &:hover,
  &.active {
    border-color: var(--accent-primary);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .label {
    display: block;
    font-size: 0.7rem;
    text-align: center;
    background: rgba(0,0,0,0.6);
    color: #fff;
    padding: 2px 0;
  }
}

.annotator-area {
  background: var(--bg-card);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.result-area .actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.loading-area {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);

  .el-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
}

.stats-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

@media (max-width: 1200px) {
  .layout-main {
    grid-template-columns: 1fr;
  }

  .sidebar-left,
  .sidebar-right {
    position: static;
  }
}
</style>
