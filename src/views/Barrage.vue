<template>

  <div class="Barragetitle">
      <h1>极品弹幕区</h1>
      <p>You are your own light</p>
</div>
  <div class="barrage-page">
    <!-- 弹幕容器 -->
    <div class="barrage-container" ref="barrageRef">
      <div
        v-for="item in barrageList"
        :key="item.id"
        class="barrage-item"
        :style="{ 
          top: item.top + 'px', 
          left: '100%',
          color: item.color,
          fontSize: item.fontSize + 'px',
          animationDuration: item.speed + 's'
        }"
        @mouseenter="pauseBarrage($event)"
        @mouseleave="resumeBarrage($event)"
        @click="showInfo(item)"
      >
        <span class="text">{{ item.content }}</span>
      </div>
    </div>

    <!-- 发送区域（优化样式，更贴合ElementPlus） -->
    <div class="send-box">
      <el-input
        v-model="content"
        placeholder="输入弹幕，按回车也能发送..."
        class="input"
        @keyup.enter="send"
        size="large"
        :maxlength="50"
        show-word-limit
      />
      <el-button type="primary" @click="send" size="large">发送弹幕</el-button>
    </div>

<!-- 弹窗查看发送人 + 时间（优化样式） -->
    <el-dialog 
      v-model="infoVisible" 
      title="弹幕详情" 
      width="500px"
      center
      :close-on-click-modal="false"
    >
      <div class="dialog-item">
        <span class="label">发送用户：</span>
        <span class="value">{{ info.username }}</span>
      </div>
      <div class="dialog-item">
        <span class="label">弹幕内容：</span>
        <span class="value">{{ info.content }}</span>
      </div>
      <div class="dialog-item">
        <span class="label">发送时间：</span>
        <span class="value">{{ formatTime(info.createTime) }}</span>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getBarrageList, sendBarrage } from '@/api/barrage.js'

const barrageList = ref([])
const content = ref('')
const barrageRef = ref(null)
const infoVisible = ref(false)
const info = ref({})
const currentUserName = ref('匿名用户') // 当前用户的姓名

// 从 JWT token 中解析用户信息（支持 UTF-8 中文字符）
const parseToken = (token) => {
  try {
    if (!token) {
      console.warn('Token is null or undefined')
      return null
    }
    
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('Invalid JWT token format, expected 3 parts but got:', parts.length)
      return null
    }
    
    const payload = parts[1]
    if (!payload) {
      console.warn('JWT payload is empty')
      return null
    }
    
    // 正确解码 Base64 URL 安全字符串
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // Pad with '=' if needed
    const pad = base64.length % 4
    if (pad) {
      if (pad === 1) {
        console.warn('Invalid base64 string')
        return null
      }
      base64 += '='.repeat(4 - pad)
    }
    
    const decodedBytes = atob(base64)
    const jsonPayload = decodeURIComponent(
      decodedBytes
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    
    const parsedData = JSON.parse(jsonPayload)
    console.log('Debug Barrage - Successfully parsed token data:', parsedData)
    return parsedData
  } catch (error) {
    console.warn('Failed to parse JWT token:', error)
    return null
  }
}

// 加载当前用户姓名
const loadCurrentUser = () => {
  try {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    console.log('Debug Barrage - localStorage token exists:', !!token)
    console.log('Debug Barrage - token:', token)
    if (token) {
      // 从 JWT token 中解析用户信息
      const tokenData = parseToken(token)
      console.log('Debug Barrage - tokenData parsed:', !!tokenData)
      console.log('Debug Barrage - tokenData:', tokenData)
      if (tokenData && tokenData.username) {
        // JWT 中的 username 字段实际上就是用户的真实姓名
        currentUserName.value = tokenData.username
        console.log('Debug Barrage - currentUserName set to:', currentUserName.value)
      } else {
        console.log('Debug Barrage - tokenData.username is missing or falsy')
        currentUserName.value = '匿名用户'
      }
    } else {
      console.log('Debug Barrage - No token found in localStorage')
      currentUserName.value = '匿名用户'
    }
  } catch (e) {
    console.log('获取用户姓名失败:', e)
    currentUserName.value = '匿名用户'
  }
}

// 加载弹幕列表 + 初始化弹幕样式（颜色、速度、字号）
const loadBarrage = async () => {
  try {
    const res = await getBarrageList()
    // 后端直接返回数组，而不是 { code, data } 包装
    const list = Array.isArray(res) ? res : []
    
    // 按创建时间排序（最新的在前面）
    const sortedList = list.sort((a, b) => {
      // 安全处理时间字段，支持字符串和时间戳
      const getTime = (timeStr) => {
        if (!timeStr) return 0
        const parsed = new Date(timeStr)
        return isNaN(parsed.getTime()) ? 0 : parsed.getTime()
      }
      const timeA = getTime(a.createTime)
      const timeB = getTime(b.createTime)
      return timeB - timeA // 最新的在前面
    })
    
    // 给每个弹幕添加样式，按时间顺序分配垂直位置
    const newList = sortedList.map((item, index) => {
      return {
        ...item,
        // 根据索引分配垂直位置，每条弹幕间隔25px，从40px开始
        // 限制在12行内循环（0-11），避免超出容器高度
        top: 40 + (index % 12) * 25,
        color: getRandomColor(), // 随机柔和颜色
        fontSize: Math.random() * 4 + 16, // 字号16-20px，分层
        speed: 18 + Math.random() * 4, // 速度18-22秒，增加一些变化但保持相对一致
      }
    })
    barrageList.value = newList
  } catch (e) {
    console.error('加载弹幕失败:', e)
    barrageList.value = []
  }
}

// 随机柔和颜色（避免刺眼，贴合弹幕场景）
const getRandomColor = () => {
  const colors = [
    '#ff7eb3', '#7eb6ff', '#7effa8', '#ffd97e', '#d47eff', 
    '#ff9e7e', '#7efff4', '#ff7e7e', '#a87eff', '#7effd4',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 发送弹幕（自动带用户名，优化回车发送）
const send = async () => {
  if (!content.value.trim()) {
    ElMessage.warning('请输入弹幕内容哦~')
    return
  }

  console.log('Debug Barrage - 发送弹幕，当前用户名:', currentUserName.value)
  
  try {
    const payload = {
      content: `${currentUserName.value}：${content.value.trim()}`,
      username: currentUserName.value,
    }
    console.log('Debug Barrage - 发送弹幕 payload:', payload)
    
    const res = await sendBarrage(payload)

    // 后端直接返回创建的弹幕对象，而不是 { code, data } 包装
    if (res && res.id) {
      ElMessage.success('发送成功！')
      content.value = '' // 清空输入框
      loadBarrage() // 立即刷新弹幕
    } else {
      ElMessage.error('发送失败，请重试~')
      console.log('Debug Barrage - sendBarrage response:', res)
    }
  } catch (err) {
    ElMessage.error('网络异常，发送失败')
    console.log('Debug Barrage - sendBarrage error:', err)
  }
}

// 查看弹幕信息
const showInfo = (item) => {
  info.value = item
  infoVisible.value = true
}

// 时间格式化（优化显示，更清晰）
const formatTime = (time) => {
  if (!time) return ''
  // 格式：2024-05-20 14:30:00
  return time.replace('T', ' ').substring(0, 19)
}

// 鼠标hover暂停弹幕
const pauseBarrage = (e) => {
  e.target.style.animationPlayState = 'paused'
}

// 鼠标离开恢复弹幕
const resumeBarrage = (e) => {
  e.target.style.animationPlayState = 'running'
}

// 组件挂载时加载数据
onMounted(() => {
  loadCurrentUser() // 加载当前用户姓名
  loadBarrage() // 加载弹幕列表
  // 定时刷新弹幕（10秒一次，不频繁，不卡顿）
  setInterval(() => {
    loadBarrage()
  }, 10000)
})
</script>

<style scoped>
/* 页面整体样式（优化背景，更有质感） */
.barrage-page {
  width: 100%;
  height: 600px;
  background: transparent;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  top: 100px;
  box-shadow: 10px 10px 20px rgba(5, 5, 5, 0.3);
}

/* 弹幕容器 */
.barrage-container {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 10px 0;
  background-color: transparent; /* 透明背景，突出弹幕 */
  overflow: hidden;
}

/* 弹幕样式（核心优化） */
.barrage-item {
  position: absolute;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  animation: barrageMove linear infinite; /* linear确保匀速 */
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer; /* 鼠标悬停时显示手型，提示可点击 */
}

/* 弹幕滚动动画（优化路径，更流畅） */
@keyframes barrageMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-2000px); /* 适配长弹幕，避免提前消失 */
  }
}

/* 弹幕hover效果 */
.barrage-item:hover {
  transform: scale(1.05);
  background: transparent;
}

.Barragetitle{
  margin-top: 50px;
  text-align: center;
}

.Barragetitle h1{
  font-size: 3em;
  margin-bottom: 20px;
  color: #fff;
}

.Barragetitle p{
  font-size: 1.2em;
  color: #ccc;
}

.send-box {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 100;
}

.input {
  width: 300px;
}

.dialog-item {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.label {
  font-weight: bold;
  color: #333;
  min-width: 80px;
}

.value {
  color: #666;
}
</style>