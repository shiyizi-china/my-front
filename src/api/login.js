import request from '@/utils/request'

// API基础URL配置
const BASE_URL = '/api/login' // 使用/api前缀，通过Vite代理转发到后端

/**
 * 用户登录接口
 * @param {Object} data - 登录数据对象
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise<Object>} 包含code、data、msg的响应对象
 * @example
 * login({
 *   username: 'admin',
 *   password: 'password'
 * }).then(res => {
 *   console.log(res)
 * }).catch(err => {
 *   console.error(err)
 * })
 */
export function loginApi(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data,
  })
}