<template>
  <div class="gallery-page">
    <div class="upload-container">
      <el-upload
        :http-request="customUpload"
        :show-file-list="false"
        accept="image/*"
      >

      <div class="imageTitle">{{ imageTitle }}</div>
        <el-button type="primary" size="large"
       class="upload-button" >
          <el-icon><Upload /></el-icon>
          上传图片
        </el-button>
      </el-upload>
    </div>

    <div class="carousel-container">
      <el-carousel
        height="220px"
        autoplay
        :interval="4000"
        arrow="always"
        :type="'card'"
        :loop="true"
      >
        <el-carousel-item v-for="item in imageList" :key="item.id">
          <img :src="item.fileUrl" class="carousel-img" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- ====================== 文章功能 ====================== -->
    <div class="article-wrapper">
      <h2 class="article-title">发布文章</h2>

      <div class="article-publish">
        <el-input v-model="articleTitle" placeholder="请输入文章标题" maxlength="100" show-word-limit />
        <el-input v-model="articleContent" type="textarea" :rows="5" placeholder="请输入文章内容" maxlength="5000" style="margin-top:15px" />
        <el-button type="primary" @click="publishArticle" style="margin-top:15px; width:120px">发布文章</el-button>
      </div>

      <h2 class="article-title" style="margin-top:40px">最新文章</h2>
      <div class="article-list">
        <el-card v-for="item in articleList" :key="item.id" class="article-card">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-info">{{ item.username }} • {{ formatTime(item.createTime) }}</div>
          <div class="card-content">{{ item.content.length > 120 ? item.content.slice(0,120) + '...' : item.content }}</div>
        </el-card>
        <div v-if="articleList.length === 0" class="empty">暂无文章</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { uploadImage, getImageList } from '@/api/home.js'

// ====================== 你原来的代码 完全不动 ======================
const imageList = ref([])

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (token) {
    await loadImageList()
  }
})

const loadImageList = async () => {
  try {
    const res = await getImageList()
    console.log('图片列表API响应:', res)
    // 后端直接返回数组，而不是 { code, data } 包装
    if (Array.isArray(res)) {
      imageList.value = res.filter(item => item.fileUrl)
    } else {
      console.log('图片列表API返回非数组格式:', res)
      imageList.value = []
    }
  } catch (error) {
    console.error('图片加载失败:', error)
    imageList.value = []
  }
}

const imageTitle = ref('Every cloud has a silver lining.')

const customUpload = async (fileObj) => {
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录后再上传图片')
    return
  }
  try {
    const res = await uploadImage(fileObj.file)
    // 后端直接返回上传的图片对象，而不是 { code, data } 包装
    if (res && res.fileUrl) {
      ElMessage.success('上传成功')
      loadImageList()
    } else {
      ElMessage.error('上传失败：' + (res?.msg || '未知错误'))
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    ElMessage.error('上传失败')
  }
}

// ====================== 文章功能（简化逻辑） ======================
import { addArticle, getArticleList } from '@/api/article.js'
// 移除 deity API 导入，因为不再需要

const articleTitle = ref('')
const articleContent = ref('')
const articleList = ref([])
const currentUserName = ref('匿名用户') // 当前用户的姓名

// 从JWT token中解析用户信息（支持UTF-8中文字符）
const parseToken = (token) => {
  try {
    const payload = token.split('.')[1]
    // 正确解码Base64 URL安全字符串
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

// 加载当前用户姓名
const loadCurrentUser = () => {
  try {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      // 从 JWT token 中解析用户信息
      const tokenData = parseToken(token)
      if (tokenData && tokenData.username) {
        // 直接使用 JWT 中的 username 字段作为用户姓名
        currentUserName.value = tokenData.username
      }
    }
  } catch (e) {
    // 忽略错误
  }
}

const loadArticles = async () => {
  try {
    const res = await getArticleList()
    console.log('文章列表API响应:', res)
    // 后端直接返回数组，而不是 { code, data } 包装
    if (Array.isArray(res)) {
      // 按创建时间倒序排序（最晚创建的放在最上方）
      const sortedArticles = [...res].sort((a, b) => {
        const timeA = new Date(a.createTime).getTime()
        const timeB = new Date(b.createTime).getTime()
        return timeB - timeA // 倒序：最新的在前面
      })
      articleList.value = sortedArticles
    } else {
      console.log('文章列表API返回非数组格式:', res)
      articleList.value = []
    }
  } catch (e) {
    console.error('文章加载失败:', e)
    articleList.value = []
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 19)
}

const publishArticle = async () => {
  const token = localStorage.getItem('token')
  if (!token) { ElMessage.warning('请先登录'); return }
  if (!articleTitle.value) { ElMessage.warning('请输入标题'); return }
  if (!articleContent.value) { ElMessage.warning('请输入内容'); return }

  try {
    // 使用真实的用户姓名而不是匿名用户
    const res = await addArticle({
      title: articleTitle.value,
      content: articleContent.value,
      username: currentUserName.value, // 使用获取到的真实姓名
    })

    // 后端直接返回创建的文章对象，而不是 { code, data } 包装
    if (res && res.id) {
      ElMessage.success('发布成功')
      articleTitle.value = ''
      articleContent.value = ''
      loadArticles()
    } else {
      ElMessage.error('发布失败：' + (res?.msg || '未知错误'))
    }
  } catch (error) {
    console.error('发布文章失败:', error)
    ElMessage.error('发布失败，请检查后端是否启动')
  }
}

// 页面加载时获取文章和用户信息
onMounted(() => {
  loadCurrentUser() // 加载当前用户姓名
  loadArticles()
})


</script>

<style scoped>
/* 你原来的样式 完全不动 */
.gallery-page {
  max-width: 1400px;
  margin: 40px auto;
  padding: 0 20px;
}
.upload-container {
  text-align: center;
  margin-bottom: 40px;
}
.carousel-container {
  margin: 40px 0;
}
.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.upload-button {
  background-color: transparent;
  color: white;
  border: 1px solid #f8f8f8;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  left: 130px;
}
.imageTitle {
  font-size: 45px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #ffffff;
  text-align: center;
  font-family:'Times New Roman', Times, serif;
}

/* 文章样式 */
.article-wrapper {
  margin-top: 60px;
}
.article-title {
  font-size: 22px;
  color: #fff;
  margin-bottom: 20px;
  font-weight: 500;
}
.article-publish {
  background: rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
}
.article-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.article-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
}
.card-title {
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 6px;
}
.card-info {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 10px;
}
.card-content {
  font-size: 14px;
  color: #eee;
  line-height: 1.5;
}
.empty {
  color: #aaa;
  text-align: center;
  padding: 40px 0;
}
</style>