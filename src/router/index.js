import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', showNav: true, requiresAuth: true },
  },
  {
    path: '/deity',
    name: 'Deity',
    component: () => import('@/views/Deity.vue'),
    meta: { title: '神来了', showNav: true, requiresAuth: true },
  },
  {
    path: '/barrage',
    name: 'Barrage',
    component: () => import('@/views/Barrage.vue'),
    meta: { title: '弹幕', showNav: true, requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', showNav: false },
  },
  {
  path: '/profile',
  name: 'Profile',
  component: () => import('@/views/Profile.vue'),
  meta: { requiresAuth: true }
}
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 全局前置守卫：检查用户是否已登录
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  
  // 如果目标路由需要认证但用户未登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 跳转到登录页面，并保存原始路径
    return {
      name: 'Login',
      query: { redirect: to.fullPath },
    }
  } else {
    // 允许访问
    return true
  }
})

export default router