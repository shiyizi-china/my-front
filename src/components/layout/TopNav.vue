<template>
  <!-- 顶部导航容器 黑色主题 -->
  <div class="top-nav-container">
    <div class="nav-content">
      <div class="nav-logo">我们的神秘小网站</div>
      <el-menu
        mode="horizontal"
        background-color="transparent"
        text-color="#ffffff"
        active-text-color="#409eff"
        router
        :default-active="activeRoute"
        class="top-nav-menu"
      >
        <el-menu-item index="/home">首页</el-menu-item>
        <el-menu-item index="/deitys">无量空处</el-menu-item>
        <el-menu-item index="/barrage">来这里发癫</el-menu-item>
      </el-menu>

      <!-- ====================== 新增：用户名 + 头像 + 个人中心入口 ====================== -->
      <div v-if="isAuthenticated" class="user-info" @click="goToProfile">
        <img :src="userAvatar" alt="头像" class="user-avatar" />
        <span class="username-text">{{ username }}</span>
      </div>

      <el-button 
        v-if="isAuthenticated" 
        @click="handleLogout"
        class="logout-btn"
      >
        退出登录
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/useAuthStore'

// 获取当前路由和路由器
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 计算属性：动态获取当前激活路由
const activeRoute = computed(() => route.path)

// 计算属性：检查用户是否已认证
const isAuthenticated = computed(() => authStore.isAuthenticated)

// ====================== 新增：安全获取用户名的计算属性 ======================
const username = computed(() => {
  // 优先使用name字段，如果没有则使用username字段
  return authStore.userInfo?.name || authStore.userInfo?.username || '用户'
})

// ====================== 新增：获取用户头像 ======================
const userAvatar = computed(() => {
  const avatar = authStore.userInfo?.avatar
  if (avatar) {
    // 如果是完整的URL（包含http或https）
    if (avatar.startsWith('http')) {
      return avatar
    }
    // 如果是本地URL（blob:开头）
    if (avatar.startsWith('blob:')) {
      return avatar
    }
    // 如果是相对路径，可能需要添加基础URL
    return avatar
  }
  // 默认头像
  return 'https://picsum.photos/id/64/200/200'
})

// 退出登录处理函数
const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

// ====================== 新增：跳转到个人中心 ======================
const goToProfile = () => {
  router.push('/profile')
}
</script>

<style scoped>
/* 导航容器样式 企业级布局 */
.top-nav-container {
  width: 100%;
  background-color: transparent;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}

/* 导航内容容器 - 左中右布局 */
.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30%;
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
}

/* Logo样式 - 最左侧，确保完全靠左 */
.nav-logo {
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: default;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}

/* 导航菜单样式 覆盖Element默认样式 */
:deep(.top-nav-menu) {
  font-weight: bold;
  border-bottom: none;
  background-color: transparent;
  flex: 1;
  display: flex;
  justify-content: center;
}

:deep(.top-nav-menu *) {
  text-decoration: none !important;
}

/* 菜单悬停效果 - 等比例放大50px */
:deep(.el-menu-item) {
  height: 60px !important;
  line-height: 60px !important;
  font-size: 16px !important;
  transition: all 0.3s ease;
  margin: 0 10px !important;
  background-color: transparent !important;
  text-decoration: none !important;
}

:deep(.el-menu-item a) {
  text-decoration: none !important;
}

:deep(.el-menu-item:hover) {
  transform: scale(1.25) !important;
  background-color: transparent !important;
  color: #fff !important;
  text-decoration: none !important;
}

:deep(.el-menu-item:hover a) {
  text-decoration: none !important;
}

:deep(.el-menu-item.is-active) {
  background-color: transparent !important;
}

/* ====================== 新增：用户信息区域样式 ====================== */
.user-info {
  display: flex;
  align-items: center;
  margin-right: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.user-info:hover {
  transform: scale(1.1);
}

/* ====================== 新增：用户头像样式 ====================== */
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  margin-right: 8px;
}

/* ====================== 更新：用户名样式（和退出风格统一） ====================== */
.username-text {
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 退出登录按钮样式 - 最右侧 */
.logout-btn {
  height: 32px;
  color: #ffffff;
  border: none;
  background-color: transparent;
  font-size: 14px;
  transition: all 0.3s ease;
  padding: 0 12px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: transparent;
  transform: scale(1.1);
  color: #ffffff;
}

/* 修复固定导航后页面内容被遮挡 */
body {
  margin: 0;
  padding-top: 100px;
}
</style>