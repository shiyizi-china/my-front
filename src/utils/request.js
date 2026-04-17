/**
 * src/utils/request.js - 基于 axios 的通用请求封装
 *
 * 功能特性：
 * - 统一的 HTTP 请求接口
 * - 自动 Token 注入（Bearer 认证）
 * - 双环境自动切换（开发/生产）
 * - 完善的错误处理和状态码分类
 * - 加载中效果提示
 * - 401 自动跳转登录页
 * - 兼容 axios 风格的 API 调用方式
 */

import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'

// 创建 axios 实例
const service = axios.create({
  baseURL: '',
  timeout: 10000,
  withCredentials: false,
})

let loadingInstance = null

// 获取 API 基础 URL
function getBaseURL() {
  // 开发环境：留空，使用相对路径，由Vite代理处理
  // 生产环境：使用环境变量或默认的线上地址
  if (import.meta.env.PROD) {
    return (
      import.meta.env.VITE_API_BASE_URL || 'https://zesty-kindness-production-c0e9.up.railway.app'
    )
  }
  return '' // 开发环境使用相对路径
}

// 显示加载提示
function showLoading() {
  loadingInstance = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
}

// 隐藏加载提示
function hideLoading() {
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseURL()
    if (config.showLoading !== false) {
      showLoading()
    }
    const token = localStorage.getItem('token')
    if (token) {
      // 使用 token 头部，匹配后端配置
      config.headers.token = token
    }
    return config
  },
  (error) => {
    hideLoading()
    console.error('Request error:', error)
    ElMessage.error('请求发送失败，请检查网络连接')
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    hideLoading()
    const res = response.data
    // 根据项目规范，如果后端返回了特定的 code 结构，可以在这里处理
    // 这里假设如果存在 code 且不为成功状态则报错，否则直接返回数据
    // 注意：原 fetch 版本并未强制检查 code，此处根据提供的 axios 参考方案保留了 code 检查逻辑
    // 如果您的后端直接返回数据而不包装 code，请调整此逻辑直接 return res
    const successCodes = [0, 1, 200]

    if (successCodes.includes(res.code)) {
      return res // 返回完整响应体 { code, msg, data }
    } else if (res.code === 401) {
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/login'
      return Promise.reject(new Error(res.msg || '未授权'))
    } else {
      // 如果没有 code 字段，或者 code 表示成功但未命中上面条件，可能需要直接返回 res
      // 这里为了兼容性，如果 res 没有 code 字段，通常视为直接返回业务数据
      if (res.code === undefined) {
        return res
      }
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
  },
  (error) => {
    hideLoading()
    if (error.response) {
      const status = error.response.status
      let message = '请求失败'
      switch (status) {
        case 401:
          message = '未授权，请重新登录'
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('user-info')
          window.location.href = '/login'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败 (${status})`
      }
      ElMessage.error(message)
    } else if (error.request) {
      ElMessage.error('网络异常，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    console.error('Response error:', error)
    return Promise.reject(error)
  },
)

export default service
