/**
 * src/services/auth.ts - 认证服务层
 * 
 * 功能说明：
 * - 封装用户认证相关的 API 调用
 * - 提供类型安全的接口定义
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
 * - 类型安全：使用 TypeScript 接口定义数据结构
 * - 单一职责：只负责认证相关的 API 调用
 */

// 导入统一的请求工具（已修复为 fetch 客户端）
import request from '@/utils/request'

// API路径配置 - 使用相对路径
const LOGIN_URL = '/login'

/**
 * 登录凭据接口定义
 * 
 * 字段说明：
 * @interface LoginCredentials
 * @property {string} username - 用户名（必填）
 * @property {string} password - 密码（必填）
 * 
 * 验证规则：
 * - username: 非空字符串，长度限制（由后端验证）
 * - password: 非空字符串，复杂度要求（由后端验证）
 */
export interface LoginCredentials {
  username: string
  password: string
}

/**
 * API 响应接口定义
 * 
 * 字段说明：
 * @interface ApiResponse
 * @property {number} code - 状态码（1=成功，其他=失败）
 * @property {T} data - 响应数据（泛型，支持不同类型）
 * @property {string} msg - 消息描述
 * 
 * 响应规范：
 * - code: 1 表示成功，其他值表示不同类型的错误
 * - data: 成功时包含业务数据，失败时可能为空或包含错误详情
 * - msg: 用户友好的消息描述
 */
export interface ApiResponse<T = any> {
  code: number
  data: T
  msg: string
}

/**
 * 用户登录服务方法
 * 
 * 功能说明：
 * - 调用登录 API 接口
 * - 处理登录凭据的传输
 * - 返回标准化的 API 响应
 * 
 * 参数说明：
 * @param data - 登录数据对象（LoginCredentials 类型）
 * 
 * 响应说明：
 * @returns Promise<ApiResponse> - 包含 code、data、msg 的响应对象
 * 
 * 错误处理：
 * - 网络错误：由底层 request 工具处理并抛出
 * - HTTP 错误：由底层 request 工具处理并抛出
 * - 业务错误：返回 code != 1 的响应对象
 * 
 * 使用示例：
 * loginApi({ username: 'admin', password: '123456' })
 *   .then(response => {
 *     if (response.code === 1) {
 *       // 登录成功
 *     } else {
 *       // 登录失败
 *     }
 *   })
 *   .catch(error => {
 *     // 网络或HTTP错误
 *   });
 */
export function loginApi(data: LoginCredentials): Promise<ApiResponse> {
  return request({
    url: LOGIN_URL,
    method: 'post',
    data
  })
}