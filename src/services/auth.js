/**
 * src/services/auth.js - 认证服务层
 * 
 * 功能说明：
 * - 封装用户认证相关的 API 调用
 * - 作为 Pinia Store 和 API 层之间的桥梁
 * - 支持标准的 Promise 异常处理
 * 
 * 架构位置：
 * - 位于 services 目录，属于服务层
 * - 调用 api 目录中的具体 API 实现
 * - 被 stores 目录中的状态管理使用
 * 
 * 设计模式：
 * - 服务层抽象：隔离业务逻辑和 API 调用
 * - 单一职责：只负责认证相关的 API 调用
 */

// 导入登录 API 方法
import { loginApi as apiLoginApi } from '@/api/login'

/**
 * 用户登录服务方法
 * 
 * 功能说明：
 * - 调用登录 API 接口
 * - 处理登录凭据的传输
 * - 返回标准化的 API 响应
 * 
 * 参数说明：
 * @param {Object} data - 登录数据对象
 * @param {string} data.username - 用户名（必填）
 * @param {string} data.password - 密码（必填）
 * 
 * 响应说明：
 * @returns {Promise<Object>} - 后端直接返回用户数据对象 { id, username, token, ... }
 * 
 * 错误处理：
 * - 网络错误：由底层 request 工具处理并抛出
 * - HTTP 错误：由底层 request 工具处理并抛出
 * - 业务错误：返回 code != 1 的响应对象
 * 
 * 使用示例：
 * loginApi({ username: 'admin', password: '123456' })
 *   .then(response => {
 *     if (response.token) {
 *       // 登录成功
 *     } else {
 *       // 登录失败
 *     }
 *   })
 *   .catch(error => {
 *     // 网络或HTTP错误
 *   });
 */
export function loginApi(data) {
  return apiLoginApi(data)
}