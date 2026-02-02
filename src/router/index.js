import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'recognize',
        name: 'Recognize',
        component: () => import('@/views/RecognizeView.vue'),
        meta: { title: '建筑识别' }
      },
      {
        path: 'compare',
        name: 'Compare',
        component: () => import('@/views/CompareView.vue'),
        meta: { title: '建筑对比' }
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: () => import('@/views/KnowledgeView.vue'),
        meta: { title: '知识图谱' }
      },
      {
        path: 'map',
        name: 'Map',
        component: () => import('@/views/MapView.vue'),
        meta: { title: '地图分布' }
      }
    ]
  },
  {
    path: '/immersive/:id?',
    name: 'Immersive',
    component: () => import('@/views/ImmersiveView.vue'),
    meta: { title: '沉浸式浏览' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 传统建筑文化识别系统` : '传统建筑文化识别系统'
  next()
})

export default router
