/**
 * useAuthStore.js - 用户认证状态管理 Store
 * 
 * 功能特性：
 * - 用户登录/登出状态管理
 * - Token 持久化存储（localStorage）
 * - 用户信息恢复和多层回退策略
 * - JWT Token 解析和验证
 * - 头像上传功能
 * - 加载状态管理
 * 
 * 技术要点：
 * - Pinia Store 状态管理
 * - localStorage 数据持久化
 * - JWT Token 标准解析流程
 * - 统一的 HTTP 请求客户端（fetch 封装）
 * - 错误处理和用户反馈
 */

// @ts-nocheck
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi } from '@/services/auth'
import { uploadAvatarApi } from '@/api/user'

/**
 * 从JWT Token解析用户名的辅助函数
 * 
 * JWT Token 结构：header.payload.signature
 * 
 * 解析流程：
 * 1. 验证Token格式（3个部分）
 * 2. 还原URL安全字符（- → +, _ → /）
 * 3. Base64解码获取Payload JSON
 * 4. 解析JSON并提取用户名字段
 * 
 * 安全考虑：
 * - 严格遵循JWT标准解析流程
 * - 处理各种异常情况避免崩溃
 * - 支持多种用户名字段（username/sub）
 * 
 * @param {string} token JWT Token 字符串
 * @returns {string|null} 解析出的用户名，失败时返回 null
 */
function parseUsernameFromToken(token) {
  if (!token) return null
  try {
    const tokenParts = token.split('.')
    if (tokenParts.length === 3) {
      // 还原URL安全字符
      const payloadBase64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')
      const payloadJson = atob(payloadBase64)
      const payload = JSON.parse(payloadJson)
      return payload.username || payload.sub || null
    }
  } catch (e) {
    console.warn('Failed to parse token for username:', e)
  }
  return null
}

/**
 * 认证状态管理 Store
 * 
 * Store ID: 'auth'
 * 
 * 状态管理策略：
 * - Token 和用户信息同时存储在内存和 localStorage 中
 * - 应用启动时自动从 localStorage 恢复状态
 * - 提供多层回退机制确保关键业务可继续执行
 * - 登出时同步清理所有相关数据
 */
export const useAuthStore = defineStore('auth', () => {
  // === 状态定义 ===

  /**
   * 认证Token状态
   * - 从 localStorage 初始化
   * - 响应式更新
   * - 登录/登出时同步更新
   */
  const token = ref(localStorage.getItem('token'))
  
  // 从localStorage恢复用户信息
  const savedUserInfo = localStorage.getItem('user-info')
  let initialUserInfo = null
  if (savedUserInfo) {
    try {
      initialUserInfo = JSON.parse(savedUserInfo)
    } catch (e) {
      console.warn('Failed to parse saved user info:', e)
      localStorage.removeItem('user-info')
    }
  }
  
  // 如果没有用户信息但有token，尝试从token解析
  if (!initialUserInfo && token.value) {
    const usernameFromToken = parseUsernameFromToken(token.value)
    if (usernameFromToken) {
      initialUserInfo = { username: usernameFromToken }
      console.log('Recovered username from token:', usernameFromToken)
    }
  }
  
  /**
   * 用户信息状态
   * - 包含用户名、ID、头像等详细信息
   * - 支持从 localStorage 或 Token Payload 恢复
   * - 响应式更新
   */
  const userInfo = ref(initialUserInfo)
  
  /**
   * 加载状态
   * - 控制登录等异步操作的加载指示器
   * - 防止重复提交
   */
  const isLoading = ref(false)

  // === 计算属性 ===

  /**
   * 用户认证状态计算属性
   * 
   * 判断逻辑：
   * - token 存在且非空时返回 true
   * - 否则返回 false
   * - 如果是JWT Token，还会检查是否过期
   * 
   * 使用场景：
   * - 路由守卫检查
   * - 条件渲染受保护内容
   * - 权限控制
   */
  const isAuthenticated = computed(() => {
    if (!token.value) {
      return false
    }
    
    // 如果是JWT Token，检查是否过期
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      const currentTime = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < currentTime) {
        // Token 已过期，清理存储
        localStorage.removeItem('token')
        localStorage.removeItem('user-info')
        token.value = null
        userInfo.value = null
        return false
      }
    } catch (e) {
      // 如果不是有效的JWT格式，按普通token处理
      console.warn('Token is not a valid JWT format:', e)
    }
    
    return !!token.value
  })

  // === Actions 方法定义 ===

  /**
   * 用户登录方法
   * 
   * 执行流程：
   * 1. 设置加载状态
   * 2. 调用登录API
   * 3. 验证响应结果
   * 4. 保存Token和用户信息到内存和localStorage
   * 5. 返回操作结果
   * 
   * 错误处理：
   * - 捕获网络异常
   * - 验证Token有效性
   * - 提供用户友好的错误消息
   * 
   * @param {Object} credentials 登录凭据对象 { username, password }
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  const login = async (credentials) => {
    try {
      console.log('Login called with credentials:', credentials)
      isLoading.value = true
      const response = await loginApi(credentials)
      
      console.log('Login API response:', response)
      
      // 根据实际后端响应格式调整判断逻辑
      // 后端直接返回 { id, username, token }，而不是 { code: 1, data: {...} }
      if (response && response.token) {
        const userData = response
        console.log('Extracted userData:', userData)
        const newToken = userData.token
      
        if (!newToken) {
          throw new Error('登录成功但未获取到有效token')
        }
      
        token.value = newToken
        localStorage.setItem('token', newToken)
        // 设置用户信息 - 支持name字段
        userInfo.value = {
          username: userData.username || credentials.username,
          name: userData.name || userData.username || credentials.username,
          id: userData.id,
          avatar: userData.avatar
        }
        console.log('Set userInfo:', userInfo.value)
        // 保存到localStorage
        localStorage.setItem('user-info', JSON.stringify(userInfo.value))
        return { success: true, message: '登录成功' }
      } else {
        console.error('Login failed with response:', response)
        return { success: false, message: '登录失败：无效的响应格式' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: '登录请求失败' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户登出方法
   * 
   * 清理内容：
   * - 内存中的Token和用户信息
   * - localStorage中的持久化数据
   * 
   * 使用场景：
   * - 用户主动登出
   * - Token过期自动登出
   * - 安全退出
   */
  const logout = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user-info')
  }

  /**
   * 设置Token方法
   * 
   * 功能说明：
   * - 更新内存和localStorage中的Token
   * - 如果没有用户信息，尝试从新Token解析
   * - 用于Token刷新或外部设置场景
   * 
   * @param {string} newToken 新的JWT Token
   */
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    
    // 如果没有用户信息，尝试从新token解析
    if (!userInfo.value) {
      const usernameFromToken = parseUsernameFromToken(newToken)
      if (usernameFromToken) {
        userInfo.value = { username: usernameFromToken }
        localStorage.setItem('user-info', JSON.stringify(userInfo.value))
        console.log('Set username from new token:', usernameFromToken)
      }
    }
  }

  /**
   * 获取用户详细信息方法
   * 
   * 当前状态：
   * - 后端未实现此接口，暂时返回成功
   * - 保留方法结构便于后续扩展
   * 
   * 未来扩展：
   * - 调用 /api/user/me 接口获取详细信息
   * - 更新用户信息状态
   * - 处理头像、权限等额外字段
   * 
   * @returns {Promise<Object>} { success: boolean }
   */
  const fetchUserInfo = async () => {
    // 如果需要获取用户详细信息，可以在这里实现
    // 目前先返回成功，保持登录状态
    console.log('fetchUserInfo called but backend API not implemented')
    return { success: true }
  }

  /**
   * 上传用户头像方法
   * 
   * 功能流程：
   * 1. 验证用户信息完整性
   * 2. 创建FormData对象
   * 3. 发送文件上传请求
   * 4. 处理响应结果
   * 5. 更新本地用户信息
   * 
   * 容错机制：
   * - 多层用户信息恢复（localStorage → Token解析）
   * - 详细的错误分类和提示
   * - 本地模拟更新（后端未完全实现时）
   * 
   * @param {File} file 要上传的头像文件
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  const uploadAvatar = async (file) => {
    try {
      console.log('开始上传头像文件:', file.name, file.size, file.type)
      console.log('当前用户信息:', userInfo.value)
      
      // 检查是否有用户名
      if (!userInfo.value?.username) {
        console.error('无法上传头像：用户信息中没有用户名')
        // 尝试从localStorage重新加载
        const savedUserInfo = localStorage.getItem('user-info')
        if (savedUserInfo) {
          console.log('从localStorage重新加载用户信息:', savedUserInfo)
          try {
            userInfo.value = JSON.parse(savedUserInfo)
          } catch (e) {
            console.warn('Failed to parse saved user info:', e)
            localStorage.removeItem('user-info')
          }
        }
        
        // 如果还是没有，尝试从token解析
        if (!userInfo.value?.username && token.value) {
          const usernameFromToken = parseUsernameFromToken(token.value)
          if (usernameFromToken) {
            userInfo.value = { username: usernameFromToken }
            localStorage.setItem('user-info', JSON.stringify(userInfo.value))
            console.log('从token解析用户名:', usernameFromToken)
          }
        }
        
        if (!userInfo.value?.username) {
          return { success: false, message: '用户信息不完整，无法上传头像' }
        }
      }
      
      const formData = new FormData()
      formData.append('file', file) // 后端期望的字段名是 'file'
      
      // 使用统一的API客户端
      console.log('准备发送请求到 /user/avatar')
      const response = await uploadAvatarApi(formData)
      
      console.log('上传响应:', response)
      
      // 上传成功后，重新获取用户信息以更新头像
      // 由于后端没有提供获取用户信息的接口，这里模拟更新
      // 实际上，您需要在后端实现获取用户信息的接口
      if (userInfo.value) {
        // 假设后端保存了头像路径，我们可以构造一个临时URL
        // 在实际应用中，应该调用获取用户信息的API
        const timestamp = Date.now()
        userInfo.value.avatar = `/uploads/${timestamp}.jpg`
        // 更新localStorage
        localStorage.setItem('user-info', JSON.stringify(userInfo.value))
      }
      return { success: true, message: '头像上传成功' }
    } catch (error) {
      console.error('Upload avatar error:', error)
      console.error('Error message:', error.message)
      // 特别检查错误类型
      if (error.message && error.message.includes('服务器内部错误')) {
        return { success: false, message: '服务器内部错误，请联系管理员' }
      }
      return { success: false, message: '上传头像失败: ' + (error.message || '未知错误') }
    }
  }

  // === Store 导出 ===
  return {
    token,
    isLoading,
    isAuthenticated,
    userInfo,
    login,
    logout,
    setToken,
    fetchUserInfo,
    uploadAvatar
  }
})