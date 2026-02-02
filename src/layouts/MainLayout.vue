<template>
  <div class="main-layout">
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">🏛</span>
          <span class="logo-text">传统建筑文化识别系统</span>
        </div>
      </div>
      <nav class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/recognize" class="nav-link">建筑识别</router-link>
        <router-link to="/compare" class="nav-link">建筑对比</router-link>
        <router-link to="/knowledge" class="nav-link">知识图谱</router-link>
        <router-link to="/map" class="nav-link">地图分布</router-link>
      </nav>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <span>传统建筑文化特征多模态识别与提取系统 · 前端演示版</span>
    </footer>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 64px;
  background: linear-gradient(135deg, #2c1810 0%, #4a3728 100%);
  color: #f5f0e8;
  box-shadow: var(--shadow-medium);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.8rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  &.router-link-active {
    color: #c9a227;
    background: rgba(201, 162, 39, 0.15);
  }
}

.main-content {
  flex: 1;
  padding: 1.5rem 2rem;
}

.app-footer {
  padding: 0.75rem 2rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
