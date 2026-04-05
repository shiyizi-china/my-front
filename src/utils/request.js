/**
 * src/utils/request.js - 基于原生 fetch API 的通用请求封装
 * 
 * 功能特性：
 * - 统一的 HTTP 请求接口
 * - 自动 Token 注入（Bearer 认证）
 * - 环境自适应（开发环境使用代理，生产环境使用绝对URL）
 * - 完善的错误处理和状态码分类
 * - FormData 文件上传特殊处理
 * - 兼容 axios 风格的 API 调用方式
 * 
 * 环境配置：
 * - 开发环境：使用相对路径，依赖 Vite 代理转发
 * - 生产环境：使用绝对 URL，直接调用后端服务
 */

// 获取API基础地址
// 开发环境：空字符串（使用相对路径 + Vite代理）
// 生产环境：https://zesty-kindness-production-c0e9.up.railway.app
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 构建完整的请求 URL
 * 
 * 设计理念：
 * - 开发环境：使用相对路径，依赖 Vite 代理转发
 * - 生产环境：使用绝对 URL，直接调用后端服务
 * - 支持绝对 URL 直接透传（用于外部 API 调用）
 * 
 * 环境适配逻辑：
 * 1. 如果是绝对 URL（以 http 开头），直接返回
 * 2. 如果在生产环境且有 API_BASE_URL，拼接绝对 URL
 * 3. 否则使用相对路径（开发环境）
 * 
 * @param {string} url - 请求路径（相对路径或绝对URL）
 * @returns {string} 完整的请求URL
 */
function buildFullURL(url) {
  // 如果 URL 已经是完整 URL（以 http 开头），直接返回
  if (url.startsWith('http')) {
    return url
  }
  
  // 生产环境：使用绝对 URL
  if (API_BASE_URL) {
    // 处理 /api/ 和 /image 路径
    if (url.startsWith('/api/')) {
      // /api/article -> /article
      const path = url.replace(/^\/api/, '')
      return `${API_BASE_URL}${path}`
    } else if (url === '/api/login') {
      // /api/login -> /login
      return `${API_BASE_URL}/login`
    } else if (url.startsWith('/image')) {
      // /image -> /image
      return `${API_BASE_URL}${url}`
    } else if (url.startsWith('/api/user/avatar')) {
      // /api/user/avatar -> /user/avatar
      return `${API_BASE_URL}${url.replace(/^\/api/, '')}`
    }
    // 其他情况也使用绝对URL
    return `${API_BASE_URL}${url}`
  }
  
  // 开发环境：使用相对路径，依赖 Vite 代理配置
  return url.startsWith('/') ? url : `/${url}`
}

/**
 * 创建请求头
 * 
 * 功能说明：
 * - 设置默认 Content-Type 为 application/json
 * - 合并自定义请求头
 * - 自动注入认证 Token（从 localStorage 获取）
 * - 遵循标准 Bearer Token 认证格式
 * 
 * 安全考虑：
 * - Token 存储在 localStorage，键名为 'token'
 * - 只有存在有效 Token 时才添加 Authorization 头
 * - 避免空 Token 导致的无效请求
 * 
 * @param {Object} customHeaders - 自定义请求头对象
 * @returns {Object} 合并后的完整请求头对象
 */
function createHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  }

  // 添加认证 token
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * 通用请求函数（兼容 axios 风格的配置对象）
 * 
 * 功能流程：
 * 1. 构建完整 URL（环境自适应）
 * 2. 创建请求头（包含 Token）
 * 3. 处理请求体数据（JSON 或 FormData）
 * 4. 发送 fetch 请求
 * 5. 处理响应状态码
 * 6. 解析响应数据（JSON 或 Text）
 * 7. 错误处理和日志记录
 * 
 * 特殊处理：
 * - FormData：自动移除 Content-Type，让浏览器设置 boundary
 * - JSON 数据：自动序列化
 * - 状态码分类：提供用户友好的错误消息
 * 
 * @param {Object} config - 请求配置对象
 * @param {string} config.url - 请求 URL（相对路径或绝对URL）
 * @param {string} [config.method='GET'] - HTTP 请求方法
 * @param {Object} [config.data] - 请求数据（用于 POST/PUT/PATCH）
 * @param {Object} [config.headers] - 自定义请求头
 * @returns {Promise<any>} 解析后的响应数据
 * @throws {Error} 网络错误或 HTTP 状态码错误
 */
async function request(config) {
  const { url, method = 'GET', data, headers: customHeaders } = config
  
  const fullURL = buildFullURL(url)
  const headers = createHeaders(customHeaders)

  const fetchOptions = {
    method: method.toUpperCase(),
    headers
  }

  // 处理请求体数据
  if (data instanceof FormData) {
    // FormData 特殊处理：移除 Content-Type，让浏览器自动设置 boundary
    fetchOptions.body = data
    delete fetchOptions.headers?.['Content-Type']
  } else if (data !== null && data !== undefined && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    // JSON 数据：自动序列化
    fetchOptions.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(fullURL, fetchOptions)

    // 检查 HTTP 状态码
    if (!response.ok) {
      let errorMessage = '网络请求失败'
      switch (response.status) {
        case 401:
          errorMessage = '未授权，请重新登录'
          break
        case 403:
          errorMessage = '拒绝访问'
        case 404:
          errorMessage = '请求资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = `请求失败 (${response.status})`
      }
      throw new Error(errorMessage)
    }

    // 解析响应数据
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json()
      return responseData
    } else {
      const textData = await response.text()
      return textData
    }

  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}

// === 便捷方法定义 ===

/**
 * GET 请求便捷方法
 * 
 * 使用示例：
 * request.get('/api/users')
 * request.get('/api/users', { headers: { 'Custom-Header': 'value' } })
 * 
 * @param {string} url - 请求 URL
 * @param {Object} options - 请求选项（headers, etc.）
 * @returns {Promise<any>} 响应数据
 */
function getRequest(url, options = {}) {
  return request({
    url,
    method: 'GET',
    ...options
  })
}

/**
 * POST 请求便捷方法
 * 
 * 使用示例：
 * request.post('/api/users', { name: 'John' })
 * request.post('/api/users', { name: 'John' }, { headers: { 'Custom-Header': 'value' } })
 * 
 * @param {string} url - 请求 URL
 * @param {Object} data - 请求数据
 * @param {Object} options - 请求选项
 * @returns {Promise<any>} 响应数据
 */
function postRequest(url, data = null, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT 请求便捷方法
 * 
 * 使用示例：
 * request.put('/api/users/1', { name: 'Updated John' })
 * 
 * @param {string} url - 请求 URL
 * @param {Object} data - 请求数据
 * @param {Object} options - 请求选项
 * @returns {Promise<any>} 响应数据
 */
function putRequest(url, data = null, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE 请求便捷方法
 * 
 * 使用示例：
 * request.delete('/api/users/1')
 * request.delete('/api/users/1', { headers: { 'Custom-Header': 'value' } })
 * 
 * @param {string} url - 请求 URL
 * @param {Object} options - 请求选项
 * @returns {Promise<any>} 响应数据
 */
function deleteRequest(url, options = {}) {
  return request({
    url,
    method: 'DELETE',
    ...options
  })
}

// 使 request 函数也包含具体方法，支持两种使用方式
// 方式1: request({ url: '/api/users', method: 'GET' })
// 方式2: request.get('/api/users')
request.get = getRequest
request.post = postRequest
request.put = putRequest
request.delete = deleteRequest

// 导出统一的请求工具
export default request