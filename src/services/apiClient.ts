// src/services/apiClient.ts
// 通用请求封装，基于 axios
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '',
  timeout: 60000 // 请求超时时间
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证 token - 使用后端期望的 token 头部
    const authStore = useAuthStore()
    const token = authStore.token
    
    if (token) {
      config.headers = config.headers || {}
      config.headers['token'] = token
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    let errorMessage = '网络请求失败'
    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 401:
          errorMessage = '未授权，请重新登录'
          // 清除token并跳转到登录页
          const authStore = useAuthStore()
          authStore.logout()
          window.location.href = '/login'
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = `请求失败 (${status})`
      }
    } else if (error.request) {
      errorMessage = '网络连接异常'
    }
    
    return Promise.reject(new Error(errorMessage))
  }
)

export default apiClient