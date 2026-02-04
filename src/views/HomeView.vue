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
        <div class="feature-card" @click="$router.push('/recognize')">
          <div class="feature-icon">📷</div>
          <h3>建筑识别</h3>
          <p>上传建筑图片/视频，智能识别类型、地域风格、朝代风格及关键构件</p>
        </div>
        <div class="feature-card" @click="$router.push('/compare')">
          <div class="feature-icon">📊</div>
          <h3>建筑对比</h3>
          <p>多建筑横向对比分析，风格演化可视化</p>
        </div>
        <div class="feature-card" @click="$router.push('/knowledge')">
          <div class="feature-icon">🗺</div>
          <h3>知识图谱</h3>
          <p>建筑—朝代—地域—文化关系网络，智能推荐相似案例</p>
        </div>
        <div class="feature-card" @click="$router.push('/map')">
          <div class="feature-icon">📍</div>
          <h3>地图分布</h3>
          <p>建筑分布地图可视化，地域与风格空间展示</p>
        </div>
        <div class="feature-card" @click="$router.push('/cultural-value')">
          <div class="feature-icon">⭐</div>
          <h3>文化价值评估</h3>
          <p>多维度价值评分、同类对比排名、AI保护建议与报告导出</p>
        </div>
        <div class="feature-card" @click="$router.push('/similarity')">
          <div class="feature-icon">🔍</div>
          <h3>风格相似性分析</h3>
          <p>二维风格嵌入空间、Top-N相似检索、AI可解释性</p>
        </div>
      </div>
    </section>

    <section class="quick-stats" v-if="1">
      <h2>识别统计</h2>
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ 1052 + store.images.length }}</span>
          <span class="stat-label">已识别建筑</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ 63 + store.typeDistribution.length }}</span>
          <span class="stat-label">建筑类型</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ 55 + store.styleDistribution.length }}</span>
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
  cursor: pointer;
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
