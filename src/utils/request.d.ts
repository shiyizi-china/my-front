import { AxiosInstance, AxiosRequestConfig } from 'axios'

// 扩展 AxiosRequestConfig 添加自定义属性
declare module 'axios' {
  interface AxiosRequestConfig {
    // 是否显示加载效果，默认 true
    showLoading?: boolean
  }
}

// 导出 axios 实例类型
const request: AxiosInstance

export default request

export interface RequestConfig {
  url: string
  method?: string
  data?: any
  headers?: Record<string, string>
  [key: string]: any
}

interface RequestFunction {
  (config: RequestConfig): Promise<any>
  get(url: string, options?: Omit<RequestConfig, 'url' | 'method'>): Promise<any>
  post(url: string, data?: any, options?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<any>
  put(url: string, data?: any, options?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<any>
  delete(url: string, options?: Omit<RequestConfig, 'url' | 'method'>): Promise<any>
}

declare const request: RequestFunction

export default request