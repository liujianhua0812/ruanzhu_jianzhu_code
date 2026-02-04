<template>
  <div class="home-view">
    <section class="hero">
      <h1 class="hero-title">传统建筑文化特征多模态识别与提取系统</h1>
      <p class="hero-desc">基于深度学习的传统建筑类型、风格智能识别与文化特征提取</p>
      <el-button type="primary" size="large" @click="$router.push('/recognize')">
        <el-icon><Upload /></el-icon>
        开始识别
      </el-button>
    </section>

    <section class="features">
      <h2>核心功能</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">📷</div>
          <h3>多模态输入</h3>
          <p>支持建筑照片、视频关键帧多种输入方式</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🏯</div>
          <h3>智能识别</h3>
          <p>自动识别建筑类型、地域风格、朝代风格及关键构件</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>可解释化</h3>
          <p>高亮判定依据区域，提供文字说明，支持学术研究</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🗺</div>
          <h3>知识图谱</h3>
          <p>建筑—朝代—地域—文化关系网络，智能推荐相似案例</p>
        </div>
      </div>
    </section>

    <section class="quick-stats" v-if="store.images.length">
      <h2>识别统计</h2>
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ store.images.length }}</span>
          <span class="stat-label">已识别建筑</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ store.typeDistribution.length }}</span>
          <span class="stat-label">建筑类型</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ store.styleDistribution.length }}</span>
          <span class="stat-label">风格类别</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Upload } from '@element-plus/icons-vue'
import { useArchitectureStore } from '@/stores/architectureStore'

const store = useArchitectureStore()
</script>

<style lang="scss" scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(180deg, rgba(139, 69, 19, 0.06) 0%, transparent 100%);
  border-radius: 16px;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.hero-desc {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.features h2,
.quick-stats h2 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.feature-card h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.quick-stats {
  margin-top: 3rem;
  padding: 2rem;
  background: var(--bg-card);
  border-radius: 12px;
}

.stats-row {
  display: flex;
  gap: 3rem;
  justify-content: center;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 600;
  color: var(--accent-primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
</style>
