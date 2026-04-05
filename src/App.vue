<template>
  <!-- 
    鼠标轨迹特效画布
    - 创建跟随鼠标移动的动态轨迹效果
    - 使用 fixed 定位确保覆盖整个页面
    - pointer-events: none 确保不影响页面交互
    - z-index: 99999 确保在最顶层显示
  -->
  <canvas
    id="mouse-trail-canvas"
    style="position: fixed; left: 0; top: 0; pointer-events: none; z-index: 99999"
  ></canvas>
  
  <!-- 顶部导航栏 -->
  <!-- 
    条件渲染导航栏
    - 根据路由 meta 信息动态显示/隐藏
    - 实现不同页面的布局需求（如登录页无导航）
  -->
  <TopNav v-if="showNav"></TopNav>
  
  <!-- 主内容区域 -->
  <!-- 
    路由视图容器
    - 包含所有页面组件的渲染出口
    - 根据是否显示导航栏应用不同的样式类
    - with-nav 类用于调整有导航栏时的布局间距
  -->
  <main class="main-content" :class="{ 'with-nav': showNav }">
    <router-view />
  </main>
</template>

<script setup lang="ts">
/**
 * App.vue - 应用根组件
 * 
 * 功能特性：
 * - 全局布局管理（导航栏显示控制）
 * - 用户状态初始化和恢复
 * - 鼠标轨迹特效实现
 * - 响应式设计适配
 * - 路由元信息处理
 * 
 * 技术要点：
 * - Vue 3 Composition API
 * - TypeScript 类型安全
 * - Canvas 动画实现
 * - Pinia 状态管理集成
 * - Vue Router 路由元信息使用
 */

// Vue 核心导入
import { onMounted, onBeforeUnmount, computed, ref } from 'vue'

// 路由相关导入
import { useRoute } from 'vue-router'

// 组件导入
import TopNav from './components/layout/TopNav.vue'

// 状态管理导入
import { useAuthStore } from './stores/useAuthStore'

// === 组合式函数调用 ===

/**
 * 当前路由信息
 * - 用于获取路由元信息（meta）
 * - 控制导航栏的显示状态
 */
const route = useRoute()

/**
 * 认证状态管理 Store
 * - 处理用户登录状态和信息
 * - 提供用户信息获取方法
 */
const authStore = useAuthStore()

// === 计算属性 ===

/**
 * 导航栏显示状态计算属性
 * 
 * 逻辑说明：
 * - 默认显示导航栏 (showNav = true)
 * - 当路由 meta.showNav 明确设置为 false 时隐藏导航栏
 * - 实现登录页、注册页等特殊页面的无导航布局
 * 
 * 使用场景：
 * - 登录页面：route.meta.showNav = false
 * - 普通页面：默认显示导航栏
 */
const showNav = computed(() => {
  return route.meta.showNav !== false
})

// === 生命周期钩子 ===

/**
 * 组件挂载后执行的初始化逻辑
 * 
 * 执行流程：
 * 1. 输出调试日志，显示当前用户状态
 * 2. 如果用户已认证，获取详细的用户信息
 * 3. 初始化鼠标轨迹特效
 * 4. 设置窗口事件监听器
 */
onMounted(async () => {
  // 调试日志：用户信息恢复
  console.log('App mounted - Token:', localStorage.getItem('token'))
  console.log('App mounted - User info:', localStorage.getItem('user-info'))
  console.log('App mounted - Store userInfo:', authStore.userInfo)
  
  // 如果已登录，获取用户详细信息
  if (authStore.isAuthenticated) {
    await authStore.fetchUserInfo()
  }
  
  // 初始化鼠标轨迹特效
  const canvas = document.getElementById('mouse-trail-canvas') as HTMLCanvasElement
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  resizeCanvas(canvas)
  window.addEventListener('resize', () => resizeCanvas(canvas))
  document.addEventListener('mousemove', onMouseMove)
  animate(ctx)
})

// === 鼠标轨迹特效实现 ===

/**
 * 鼠标轨迹点数组
 * - 存储鼠标移动轨迹的坐标点
 * - 使用响应式 ref 包装以支持 Vue 的响应式系统
 */
let trail = ref<Array<{ x: number; y: number }>>([])

/**
 * 动画帧 ID
 * - 存储 requestAnimationFrame 的返回值
 * - 用于在组件卸载时取消动画
 */
let animationId = ref<number | null>(null)

/**
 * 上次鼠标移动时间戳
 * - 用于检测鼠标是否停止移动
 * - 实现轨迹逐渐消失的效果
 */
let lastMoveTime = ref(Date.now())

/**
 * 轨迹最大点数
 * - 限制轨迹长度，避免性能问题
 * - 值越大轨迹越长，但性能开销也越大
 */
const TRAIL_MAX = 30

// const TRAIL_FADE_SPEED = 2 // 越大消失越快 (未使用的变量已注释)

/**
 * 绘制鼠标轨迹
 * 
 * 实现细节：
 * - 清除画布
 * - 遍历轨迹点数组，绘制连接线段
 * - 使用透明度渐变实现轨迹淡出效果
 * - 线宽随轨迹位置变化，形成锥形效果
 * 
 * @param ctx Canvas 2D 渲染上下文
 */
function drawTrail(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  if (trail.value.length < 2) return
  for (let i = 0; i < trail.value.length - 1; i++) {
    const p1 = trail.value[i]
    const p2 = trail.value[i + 1]
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.strokeStyle = `rgba(0, 123, 255, ${1 - i / TRAIL_MAX})`
    ctx.lineWidth = 8 * (1 - i / TRAIL_MAX) + 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

/**
 * 动画循环函数
 * 
 * 功能说明：
 * - 调用 drawTrail 绘制轨迹
 * - 检测鼠标是否停止移动
 * - 如果鼠标停止，逐渐移除轨迹点
 * - 使用 requestAnimationFrame 实现流畅动画
 * 
 * @param ctx Canvas 2D 渲染上下文
 */
function animate(ctx: CanvasRenderingContext2D) {
  drawTrail(ctx)
  // 鼠标停止时逐渐消失
  if (Date.now() - lastMoveTime.value > 20) {
    if (trail.value.length > 0) {
      trail.value.pop()
    }
  }
  animationId.value = requestAnimationFrame(() => animate(ctx))
}

/**
 * 调整画布尺寸
 * 
 * 功能说明：
 * - 将画布尺寸设置为窗口尺寸
 * - 确保轨迹特效覆盖整个视口
 * - 响应窗口大小变化
 * 
 * @param canvas HTMLCanvasElement 元素
 */
function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

/**
 * 鼠标移动事件处理器
 * 
 * 功能说明：
 * - 记录鼠标当前位置到轨迹数组
 * - 更新最后移动时间戳
 * - 限制轨迹数组长度不超过 TRAIL_MAX
 * 
 * @param e MouseEvent 鼠标事件对象
 */
function onMouseMove(e: MouseEvent) {
  lastMoveTime.value = Date.now()
  trail.value.unshift({ x: e.clientX, y: e.clientY })
  if (trail.value.length > TRAIL_MAX) trail.value.length = TRAIL_MAX
}

/**
 * 组件卸载前清理资源
 * 
 * 清理内容：
 * - 取消动画帧
 * - 移除窗口事件监听器
 * - 移除鼠标移动事件监听器
 * - 防止内存泄漏
 */
onBeforeUnmount(() => {
  if (animationId.value) cancelAnimationFrame(animationId.value)
  window.removeEventListener('resize', () => resizeCanvas(window as any as HTMLCanvasElement))
  document.removeEventListener('mousemove', onMouseMove)
})
</script>

<style>
/**
 * 全局样式定义
 * 
 * 设计理念：
 * - 企业级基础样式重置
 * - 全局背景图片设置
 * - 响应式布局适配
 * - 内容区域样式优化
 * 
 * 技术特性：
 * - 使用 CSS 变量和现代布局技术
 * - 固定背景实现视差效果
 * - 半透明背景确保文字可读性
 */

/* 全局样式重置 企业级基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 页面主体样式 */
body {
  font-family: 'Microsoft YaHei', sans-serif;
  min-height: 100vh;
  /* 将背景图片应用到body并固定显示 */
  background-image: url('/background.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center 0px;
}

/* 主内容区域基础样式 */
.main-content {
  min-height: 100vh;
  width: 100%;
}

/* 有导航栏时的内容区域样式 */
.main-content.with-nav {
  margin-top: 350px; /* 调整为导航栏的实际高度 */
  max-width: 1000px; /* 使用max-width而不是固定width，提供更好的响应式体验 */
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 20px 40px; /* 增加上下内边距和左右内边距，使内容更舒适 */
  box-sizing: border-box;
  /* 移除背景图片，使用纯色半透明背景确保文字可读性 */
  background-color: rgba(61, 53, 53, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  min-height: calc(110vh - 100px); /* 确保内容区域至少占满剩余空间 */
}
</style>