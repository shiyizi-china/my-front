<template>
  <canvas
    id="mouse-trail-canvas"
    style="position: fixed; left: 0; top: 0; pointer-events: none; z-index: 99999"
  ></canvas>
  <!-- 顶部导航 -->
  <TopNav v-if="showNav"></TopNav>
  <!-- 路由出口 -->
  <main class="main-content" :class="{ 'with-nav': showNav }">
    <router-view />
  </main>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from './components/layout/TopNav.vue'
import { useAuthStore } from './stores/useAuthStore'

const route = useRoute()
const authStore = useAuthStore()

// 根据路由meta信息判断是否显示导航
const showNav = computed(() => {
  return route.meta.showNav !== false
})

// 应用启动时获取用户信息
onMounted(async () => {
  // 调试日志：用户信息恢复
  console.log('App mounted - Token:', localStorage.getItem('token'))
  console.log('App mounted - User info:', localStorage.getItem('user-info'))
  console.log('App mounted - Store userInfo:', authStore.userInfo)
  
  // 如果已登录，获取用户详细信息
  if (authStore.isAuthenticated) {
    await authStore.fetchUserInfo()
  }
  
  const canvas = document.getElementById('mouse-trail-canvas') as HTMLCanvasElement
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  resizeCanvas(canvas)
  window.addEventListener('resize', () => resizeCanvas(canvas))
  document.addEventListener('mousemove', onMouseMove)
  animate(ctx)
})

let trail = ref<Array<{ x: number; y: number }>>([])
let animationId = ref<number | null>(null)
let lastMoveTime = ref(Date.now())
const TRAIL_MAX = 30
// const TRAIL_FADE_SPEED = 2 // 越大消失越快 (未使用的变量已注释)

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

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function onMouseMove(e: MouseEvent) {
  lastMoveTime.value = Date.now()
  trail.value.unshift({ x: e.clientX, y: e.clientY })
  if (trail.value.length > TRAIL_MAX) trail.value.length = TRAIL_MAX
}

onBeforeUnmount(() => {
  if (animationId.value) cancelAnimationFrame(animationId.value)
  window.removeEventListener('resize', () => resizeCanvas(window as any as HTMLCanvasElement))
  document.removeEventListener('mousemove', onMouseMove)
})
</script>

<style>
/* 全局样式重置 企业级基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

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

.main-content {
  min-height: 100vh;
  width: 100%;
}

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