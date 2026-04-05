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