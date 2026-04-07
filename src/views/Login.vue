<template>
  <!-- 
    登录页面根容器
    - 使用全屏背景图片作为视觉基础
    - 采用 flex 布局实现内容垂直水平居中
    - 包含动态网格背景和登录卡片两个主要视觉元素
  -->
  <div class="login-page">
    <!-- 动态网格背景 -->
    <!-- 
      创建半透明的网格动画背景效果
      - 使用 CSS Grid 背景图案
      - 通过 animation 实现平滑移动效果
      - 增强页面的科技感和视觉层次
    -->
    <div class="grid-bg"></div>

    <!-- 登录卡片容器 -->
    <!-- 
      主要的登录表单区域
      - 使用 fade-in 动画实现进入效果
      - 包含标题、副标题、登录表单和页脚
      - 采用毛玻璃效果 (backdrop-filter) 提升视觉质感
    -->
    <div class="login-card" :class="animate">
      <!-- 主标题：应用名称 -->
      <div class="title"> 我们的群博客 </div>
      
      <!-- 副标题：应用标语 -->
      <div class="sub-title">现在所有人v我50</div>

      <!-- 登录表单 -->
      <!-- 
        使用 Element Plus 的表单组件
        - label-width="0" 隐藏标签（因为使用了 placeholder）
        - 包含用户名和密码两个输入字段
        - 底部包含登录按钮
      -->
      <el-form :model="form" label-width="0" class="login-form">
        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
          >
            <!-- 用户名图标前缀 -->
            <!-- 使用内联 SVG 图标，避免图标库依赖问题 -->
            <template #prefix>
              <svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" style="margin-right: 8px;">
                <path d="M840.96 373.76c-16.64-122.88-116.48-217.6-238.08-217.6s-221.44 94.72-238.08 217.6c-19.2 143.36 57.6 275.2 172.8 336.64l51.2 25.6 51.2-25.6c115.2-61.44 192-193.28 172.8-336.64z m-320-302.08c89.6 0 166.4 61.44 185.6 143.36-25.6-10.24-53.76-15.36-81.92-15.36-122.88 0-222.72 99.84-222.72 222.72 0 28.16 5.12 56.32 15.36 81.92-81.92-19.2-143.36-96-143.36-185.6 0.32-122.56 99.84-222.08 222.4-222.08 28.16 0 53.76 5.12 81.92 15.36z"></path>
                <path d="M888.32 512c-16.64-122.88-116.48-217.6-238.08-217.6-25.6 0-51.2 3.2-76.8 8.32 23.04-115.2 122.88-204.8 243.2-204.8 133.12 0 243.2 107.52 243.2 240.64 0 23.04-3.2 46.08-8.32 69.12-25.6-25.6-53.76-46.08-84.48-61.44z"></path>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
          >
            <!-- 密码图标前缀 -->
            <!-- 使用内联 SVG 锁图标，保持视觉一致性 -->
            <template #prefix>
              <svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" style="margin-right: 8px;">
                <path d="M384 512h256V320H384v192z m384-288V160c0-26.5-21.5-48-48-48H288c-26.5 0-48 21.5-48 48v64H192c-53 0-96 43-96 96v448c0 53 43 96 96 96h576c53 0 96-43 96-96V320c0-53-43-96-96-96h-48z m-48 0H288V160h432v64z"></path>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            @click="handleLogin"
            :loading="loading"
          >
            登 录 系 统
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 页脚版权信息 -->
      <div class="footer">© 2026 我们的群博客 所有人v我50</div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Login.vue - 用户登录页面组件
 * 
 * 功能特性：
 * - 用户认证登录功能
 * - 表单验证和错误处理
 * - 登录状态管理（加载状态、成功/失败反馈）
 * - 登录成功后路由重定向
 * - 与 Pinia Store 集成进行用户状态管理
 * 
 * 技术要点：
 * - 使用 Vue 3 Composition API (<script setup>)
 * - TypeScript 类型安全
 * - Element Plus UI 组件
 * - Vue Router 路由导航
 * - Pinia 状态管理
 */

// Vue 核心导入
import { ref } from 'vue'

// UI 组件库导入
import { ElMessage } from 'element-plus'

// 路由相关导入
import { useRouter, useRoute } from 'vue-router'

// 状态管理导入
import { useAuthStore } from '@/stores/useAuthStore'

// === 响应式状态定义 ===

/**
 * 登录按钮加载状态
 * - 控制登录按钮的 loading 状态显示
 * - 防止重复提交
 */
const loading = ref(false)

/**
 * 登录卡片动画类名
 * - 控制登录卡片的进入动画效果
 * - 默认使用 fade-in 动画
 */
const animate = ref('fade-in')

// === 组合式函数调用 ===

/**
 * Vue Router 实例
 * - 用于页面导航和路由操作
 */
const router = useRouter()

/**
 * 当前路由信息
 * - 用于获取查询参数（如重定向路径）
 */
const route = useRoute()

/**
 * 认证状态管理 Store
 * - 封装了登录、登出、token 管理等逻辑
 * - 提供统一的用户认证接口
 */
const authStore = useAuthStore()

// === 类型定义 ===

/**
 * 登录表单数据结构
 * - 定义用户名和密码字段的类型约束
 * - 确保类型安全的表单操作
 */
interface LoginForm {
  username: string
  password: string
}

// === 响应式数据 ===

/**
 * 登录表单数据
 * - 使用 ref 包装以支持响应式更新
 * - 初始化为空字符串
 */
const form = ref<LoginForm>({
  username: '',
  password: ''
})

// === 方法定义 ===

/**
 * 处理用户登录逻辑
 * 
 * 流程说明：
 * 1. 设置加载状态为 true，显示按钮 loading 效果
 * 2. 调用 authStore.login() 执行登录请求
 * 3. 根据登录结果进行相应处理：
 *    - 成功：显示成功消息，重定向到目标页面
 *    - 失败：显示错误消息，保持在登录页面
 * 4. 无论成功与否，最终都会重置加载状态
 * 
 * 错误处理：
 * - 捕获网络请求异常
 * - 显示用户友好的错误提示
 * - 确保 loading 状态正确重置
 * 
 * 路由重定向：
 * - 支持从其他页面跳转过来的重定向场景
 * - 默认重定向到首页 ('/home')
 */
const handleLogin = async () => {
  try {
    // 设置加载状态，防止重复提交
    loading.value = true
    
    // 调用认证 Store 的登录方法
    const result = await authStore.login(form.value)
    
    if (result.success) {
      // 登录成功：显示成功消息
      
      // 获取重定向路径（如果有）
      // 通常用于用户访问受保护页面时被重定向到登录页的场景
      const redirectPath = route.query.redirect as string || '/home'
      
      // 导航到目标页面
      await router.push(redirectPath)
      ElMessage.success(result.message)
    } else {
      // 登录失败：显示错误消息
      ElMessage.error(result.message)
    }
  } catch (error) {
    // 捕获网络或其他异常
    console.error('Login error:', error)
    ElMessage.error('登录请求失败')
  } finally {
    // 重置加载状态，无论成功或失败
    loading.value = false
  }
}
</script>

<style scoped>
/**
 * 登录页面全局样式
 * 
 * 设计理念：
 * - 全屏背景：使用自定义登录背景图片
 * - 动态网格：半透明网格动画增强科技感
 * - 毛玻璃效果：登录卡片使用 backdrop-filter 实现现代感
 * - 渐变按钮：使用线性渐变提升视觉吸引力
 * - 响应式设计：适配不同屏幕尺寸
 */

/* 登录页面根容器样式 */
.login-page {
  /* 全屏覆盖 */
  width: 100vw;
  min-height: 100vh;
  
  /* 背景图片设置 */
  background: url('/loginImage.jpg') center/cover no-repeat;
  
  /* Flex 布局实现内容居中 */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* 相对定位，为绝对定位的子元素提供参考 */
  position: relative;
  
  /* 隐藏溢出内容 */
  overflow: hidden;
}

/* 动态网格背景样式 */
.grid-bg {
  /* 绝对定位，覆盖整个页面 */
  position: absolute;
  width: 200vw;
  height: 200vh;
  
  /* 创建半透明网格背景 */
  background-image:
    linear-gradient(to right, rgba(20, 120, 255, 0.12) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(20, 120, 255, 0.12) 1px, transparent 1px);
  background-size: 50px 50px;
  
  /* 网格移动动画 */
  animation: gridMove 12s linear infinite;
  
  /* 确保在背景层 */
  z-index: 0;
}

/* 网格移动动画关键帧 */
@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-50px, -50px); }
}

/* 登录卡片样式 */
.login-card {
  /* 响应式宽度 */
  width: 100%;
  max-width: 440px;
  
  /* 内边距 */
  padding: 50px 40px;
  
  /* 半透明深色背景 */
  background: rgba(10, 10, 15, 0.85);
  
  /* 边框样式 */
  border: 1px solid rgba(20, 120, 255, 0.2);
  border-radius: 16px;
  
  /* 毛玻璃效果 */
  backdrop-filter: blur(12px);
  
  /* 阴影效果 */
  box-shadow: 0 0 60px rgba(20, 120, 255, 0.1);
  
  /* 相对定位，确保在网格背景之上 */
  position: relative;
  z-index: 10;
}

/* 淡入动画类 */
.fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

/* 淡入动画关键帧 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 标题样式 */
.title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

/* 副标题样式 */
.sub-title {
  text-align: center;
  color: #889;
  font-size: 14px;
  margin-bottom: 40px;
}

/* 登录表单样式 */
.login-form {
  width: 100%;
}

/* 登录按钮样式 */
.login-btn {
  width: 100%;
  
  /* 蓝色渐变背景 */
  background: linear-gradient(90deg, #1478ff, #0066ee);
  
  /* 移除边框 */
  border: none;
  
  /* 字体加粗 */
  font-weight: 500;
  letter-spacing: 1px;
}

/* 登录按钮悬停效果 */
.login-btn:hover {
  background: linear-gradient(90deg, #0066ee, #0055cc);
}

/* 页脚样式 */
.footer {
  text-align: center;
  margin-top: 30px;
  color: #667;
  font-size: 13px;
}
</style>