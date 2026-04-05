<template>
  <div class="login-page">
    <!-- 动态网格背景 -->
    <div class="grid-bg"></div>

    <!-- 登录卡片 -->
    <div class="login-card" :class="animate">
      <div class="title"> 我们的群博客 </div>
      <div class="sub-title">现在所有人v我50</div>

      <el-form :model="form" label-width="0" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" style="margin-right: 8px;">
                <path d="M840.96 373.76c-16.64-122.88-116.48-217.6-238.08-217.6s-221.44 94.72-238.08 217.6c-19.2 143.36 57.6 275.2 172.8 336.64l51.2 25.6 51.2-25.6c115.2-61.44 192-193.28 172.8-336.64z m-320-302.08c89.6 0 166.4 61.44 185.6 143.36-25.6-10.24-53.76-15.36-81.92-15.36-122.88 0-222.72 99.84-222.72 222.72 0 28.16 5.12 56.32 15.36 81.92-81.92-19.2-143.36-96-143.36-185.6 0.32-122.56 99.84-222.08 222.4-222.08 28.16 0 53.76 5.12 81.92 15.36z"></path>
                <path d="M888.32 512c-16.64-122.88-116.48-217.6-238.08-217.6-25.6 0-51.2 3.2-76.8 8.32 23.04-115.2 122.88-204.8 243.2-204.8 133.12 0 243.2 107.52 243.2 240.64 0 23.04-3.2 46.08-8.32 69.12-25.6-25.6-53.76-46.08-84.48-61.44z"></path>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
          >
            <template #prefix>
              <svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" style="margin-right: 8px;">
                <path d="M384 512h256V320H384v192z m384-288V160c0-26.5-21.5-48-48-48H288c-26.5 0-48 21.5-48 48v64H192c-53 0-96 43-96 96v448c0 53 43 96 96 96h576c53 0 96-43 96-96V320c0-53-43-96-96-96h-48z m-48 0H288V160h432v64z"></path>
              </svg>
            </template>
          </el-input>
        </el-form-item>

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

      <div class="footer">© 2026 我们的群博客 所有人v我50</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const loading = ref(false)
const animate = ref('fade-in')

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

interface LoginForm {
  username: string
  password: string
}

const form = ref<LoginForm>({
  username: '',
  password: ''
})

// 登录逻辑
const handleLogin = async () => {
  try {
    loading.value = true
    const result = await authStore.login(form.value)
    
    if (result.success) {
      ElMessage.success(result.message)
      
      // 获取重定向路径（如果有）
      const redirectPath = route.query.redirect as string || '/'
      await router.push(redirectPath)
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error('登录请求失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  width: 100vw;
  min-height: 100vh;
  background: url('/loginImage.jpg') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 动态网格背景 */
.grid-bg {
  position: absolute;
  width: 200vw;
  height: 200vh;
  background-image:
    linear-gradient(to right, rgba(20, 120, 255, 0.12) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(20, 120, 255, 0.12) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 12s linear infinite;
  z-index: 0;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-50px, -50px); }
}

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 440px;
  padding: 50px 40px;
  background: rgba(10, 10, 15, 0.85);
  border: 1px solid rgba(20, 120, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 60px rgba(20, 120, 255, 0.1);
  position: relative;
  z-index: 10;
}

.fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 标题 */
.title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.sub-title {
  text-align: center;
  color: #889;
  font-size: 14px;
  margin-bottom: 40px;
}

/* 表单 */
.login-form {
  width: 100%;
}

/* 按钮 */
.login-btn {
  width: 100%;
  background: linear-gradient(90deg, #1478ff, #0066ee);
  border: none;
  font-weight: 500;
  letter-spacing: 1px;
}

.login-btn:hover {
  background: linear-gradient(90deg, #0066ee, #0055cc);
}

.footer {
  text-align: center;
  margin-top: 30px;
  color: #667;
  font-size: 13px;
}
</style>