// src/utils/request.js
// 基于原生 fetch API 的通用请求封装

// 获取环境变量中的 API 基础 URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * 构建完整的请求 URL
 * @param {string} url - 请求路径
 * @returns {string} 完整的 URL
 */
function buildFullURL(url) {
  // 如果 URL 已经是完整 URL（以 http 开头），直接返回
  if (url.startsWith('http')) {
    return url
  }
  // 否则拼接基础 URL
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * 创建请求头
 * @param {Object} customHeaders - 自定义请求头
 * @returns {Object} 合并后的请求头
 */
function createHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  }

  // 添加认证 token
  const loginUser = localStorage.getItem('loginUser')
  if (loginUser) {
    try {
      const user = JSON.parse(loginUser)
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`
      }
    } catch (error) {
      console.warn('Failed to parse login user from localStorage')
    }
  }

  return headers
}

/**
 * 通用请求函数（兼容 axios 风格的配置对象）
 * @param {Object} config - 请求配置对象
 * @param {string} config.url - 请求 URL
 * @param {string} [config.method='GET'] - 请求方法
 * @param {Object} [config.data] - 请求数据（用于 POST/PUT）
 * @param {Object} [config.headers] - 请求头
 * @returns {Promise<any>} 响应数据
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
    fetchOptions.body = data
    delete fetchOptions.headers?.['Content-Type']
  } else if (data !== null && data !== undefined && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
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
          break
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

/**
 * GET 请求方法
 * @param {string} url - 请求 URL
 * @param {Object} options - 请求选项
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
 * POST 请求方法
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
 * PUT 请求方法
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
 * DELETE 请求方法
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
request.get = getRequest
request.post = postRequest
request.put = putRequest
request.delete = deleteRequest

export default request