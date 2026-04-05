/**
 * router/index.js - 应用路由配置
 * 
 * 功能特性：
 * - 页面路由定义和映射
 * - 路由元信息配置（标题、导航显示、认证要求）
 * - 全局路由守卫（认证检查）
 * - 重定向处理（未登录用户跳转到登录页）
 * 
 * 技术要点：
 * - Vue Router 4.x 路由系统
 * - 动态导入（懒加载）优化性能
 * - 路由元信息（meta）灵活配置
 * - 全局前置守卫实现权限控制
 */

// Vue Router 核心导入
import { createRouter, createWebHistory } from 'vue-router'

// 状态管理导入（用于路由守卫中的认证检查）
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * 路由配置数组
 * 
 * 路由元信息说明：
 * - title: 页面标题（可用于动态设置 document.title）
 * - showNav: 是否显示顶部导航栏（false 表示隐藏）
 * - requiresAuth: 是否需要用户认证才能访问
 * 
 * 路由懒加载：
 * - 使用 () => import() 语法实现按需加载
 * - 减少初始包体积，提升应用启动速度
 */
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

/**
 * 创建路由器实例
 * 
 * 配置说明：
 * - history: 使用 createWebHistory 创建 HTML5 History 模式的路由
 * - routes: 注入路由配置数组
 * - BASE_URL: 从 Vite 环境变量获取基础路径，支持子目录部署
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * 全局前置路由守卫
 * 
 * 功能逻辑：
 * 1. 检查目标路由是否需要认证 (requiresAuth)
 * 2. 如果需要认证但用户未登录，重定向到登录页面
 * 3. 在重定向时保存原始路径，登录后可返回原页面
 * 4. 如果不需要认证或用户已登录，允许正常访问
 * 
 * 安全性考虑：
 * - 防止未授权用户访问受保护的页面
 * - 提供友好的重定向体验
 * - 避免无限重定向循环
 */
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

// 导出路由器实例供 main.js 使用
export default router