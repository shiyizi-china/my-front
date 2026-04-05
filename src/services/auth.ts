import apiClient from './apiClient'

// API基础URL配置
const BASE_URL = '/api/login' // 使用/api前缀，通过Vite代理转发到后端

/**
 * 用户登录接口
 * @param data - 登录数据对象
 * @returns 包含code、data、msg的响应对象
 */
export interface LoginCredentials {
  username: string
  password: string
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  msg: string
}

export function loginApi(data: LoginCredentials): Promise<ApiResponse> {
  return apiClient({
    url: BASE_URL,
    method: 'post',
    data
  })
}