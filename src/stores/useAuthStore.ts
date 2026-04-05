// @ts-nocheck
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { loginApi } from '@/services/auth'
import axios from 'axios'

interface UserInfo {
  username: string
  name?: string
  id?: number
  avatar?: string
}

// 从token解析用户名的辅助函数
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

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  
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
  
  const userInfo = ref<UserInfo | null>(initialUserInfo)
  
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  const login = async (credentials: { username: string; password: string }) => {
    try {
      console.log('Login called with credentials:', credentials)
      isLoading.value = true
      const response = await loginApi(credentials)
      
      console.log('Login API response:', response)
      
      if (response.code === 1) {
        const userData = response.data?.data || response.data
        console.log('Extracted userData:', userData)
        const newToken = userData?.token
        
        if (!newToken) {
          throw new Error('登录成功但未获取到有效token')
        }
        
        token.value = newToken
        localStorage.setItem('token', newToken)
        // 设置用户信息 - 支持name字段
        userInfo.value = {
          username: credentials.username,
          name: userData?.name || userData?.username || credentials.username,
          id: userData?.id,
          avatar: userData?.avatar
        }
        console.log('Set userInfo:', userInfo.value)
        // 保存到localStorage
        localStorage.setItem('user-info', JSON.stringify(userInfo.value))
        return { success: true, message: '登录成功' }
      } else {
        console.error('Login failed with response:', response)
        return { success: false, message: response.msg || '登录失败' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: '登录请求失败' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user-info')
  }

  const setToken = (newToken: string) => {
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

  // 获取用户信息 - 由于后端没有实现此接口，暂时不调用
  const fetchUserInfo = async () => {
    // 如果需要获取用户详细信息，可以在这里实现
    // 目前先返回成功，保持登录状态
    console.log('fetchUserInfo called but backend API not implemented')
    return { success: true }
  }

  // 上传头像 - 使用后端实际实现的接口
  const uploadAvatar = async (file: File) => {
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
      
      // 直接使用axios，避免request工具的拦截器干扰
      console.log('准备发送请求到 /api/user/avatar，用户名:', userInfo.value.username)
      const response = await axios.post('/api/user/avatar', formData, {
        headers: {
          'username': userInfo.value.username,
          'token': token.value || ''
        }
      })
      
      console.log('上传响应:', response.data)
      
      const responseData = response.data
      
      if (responseData.code === 1) {
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
      } else {
        console.error('上传失败 - 后端返回错误:', responseData.msg)
        return { success: false, message: responseData.msg || '上传头像失败' }
      }
    } catch (error: any) {
      console.error('Upload avatar error:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response)
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
        // 特别检查400、404、500等状态码
        if (error.response.status === 400) {
          return { success: false, message: '请求参数错误，请检查文件格式' }
        } else if (error.response.status === 404) {
          return { success: false, message: '上传接口不存在，请检查后端配置' }
        } else if (error.response.status === 500) {
          return { success: false, message: '服务器内部错误，请联系管理员' }
        }
      }
      return { success: false, message: '上传头像失败: ' + (error.message || '未知错误') }
    }
  }

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