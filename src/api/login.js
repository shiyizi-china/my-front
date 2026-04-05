/**
 * src/api/login.js - 用户登录 API 封装
 * 
 * 功能说明：
 * - 封装用户登录接口调用
 * - 提供类型安全的参数和响应定义
 * - 集成统一的请求工具
 * - 支持标准的 Promise 异常处理
 * 
 * 接口规范：
 * - 请求方法：POST
 * - 请求路径：/login（相对路径，自动适配环境）
 * - 请求体：包含 username 和 password 的对象
 * - 响应格式：标准 Result 对象 { code, data, msg }
 * 
 * 使用示例：
 * loginApi({ username: 'admin', password: '123456' })
 *   .then(response => console.log(response))
 *   .catch(error => console.error(error))
 */

// 导入统一的请求工具
import request from '@/utils/request'

// API路径配置 - 使用相对路径
const LOGIN_URL = '/login'

/**
 * 用户登录接口
 * 
 * 参数说明：
 * @param {Object} data - 登录数据对象
 * @param {string} data.username - 用户名（必填）
 * @param {string} data.password - 密码（必填）
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 用户数据（包含 token、用户信息等）
 * - msg: 消息描述
 * 
 * 错误处理：
 * - 网络错误：抛出网络异常
 * - HTTP 错误：抛出对应的状态码错误
 * - 业务错误：返回 code != 1 的响应
 * 
 * 使用示例：
 * loginApi({
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
    url: LOGIN_URL,
    method: 'post',
    data,
  })
}