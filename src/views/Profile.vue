<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="avatar" @click="triggerFileInput">
        <img :src="userAvatar" alt="头像" />
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFileChange"
          style="display: none"
        />
        <div class="upload-tip">点击上传头像</div>
      </div>
      <h2>个人中心</h2>
      <div class="info-item">
        <span>用户名：</span>
        <span>{{ userInfo?.name || userInfo?.username || '未登录' }}</span>
      </div>
      <div class="info-item">
        <span>用户ID：</span>
        <span>{{ userInfo?.id || '—' }}</span>
      </div>
      <div class="info-item">
        <span>状态：</span>
        <span class="status">已登录</span>
      </div>
      <el-button type="primary" @click="$router.back()" style="margin-top: 20px">
        返回上一页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo)
const fileInput = ref<HTMLInputElement | null>(null)

// 计算用户头像URL
const userAvatar = computed(() => {
  if (userInfo.value?.avatar) {
    // 如果是完整的URL（包含http或https）
    if (userInfo.value.avatar.startsWith('http')) {
      return userInfo.value.avatar
    }
    // 如果是本地URL（blob:开头）
    if (userInfo.value.avatar.startsWith('blob:')) {
      return userInfo.value.avatar
    }
    // 如果是相对路径，可能需要添加基础URL
    return userInfo.value.avatar
  }
  // 默认头像
  return 'https://picsum.photos/id/64/200/200'
})

// 触发文件选择
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 处理文件选择
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 验证文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

  try {
    console.log('开始处理文件上传:', file.name)
    const result = await authStore.uploadAvatar(file)
    if (result.success) {
      if (result.message) {
        ElMessage.success(result.message)
      } else {
        ElMessage.success('头像上传成功')
      }
      // 清空文件输入框
      if (target) {
        target.value = ''
      }
    } else {
      ElMessage.error('上传失败: ' + (result.message || '未知错误'))
      console.error('上传失败详细信息:', result)
    }
  } catch (error: any) {
    const errorMessage = error.message || '上传失败，请重试'
    ElMessage.error(errorMessage)
    console.error('Upload error:', error)
  }
}
</script>

<style scoped>
.profile-page {
  width: 100%;
  padding-top: 120px;
  display: flex;
  justify-content: center;
}
.profile-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  color: #fff;
}
.avatar {
  margin-bottom: 20px;
  cursor: pointer;
  position: relative;
  display: inline-block;
}
.avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  transition: transform 0.3s ease;
}
.avatar:hover img {
  transform: scale(1.05);
}
.upload-tip {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #999;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.avatar:hover .upload-tip {
  opacity: 1;
}
.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.status {
  color: #67c23a;
  font-weight: bold;
}
</style>
