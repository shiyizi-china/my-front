/**
 * src/api/article.js - 文章管理 API 封装
 * 
 * 功能说明：
 * - 封装文章发布和获取接口
 * - 提供类型安全的参数和响应定义
 * - 集成统一的请求工具和认证机制
 * - 支持标准的 CRUD 操作
 * 
 * 接口规范：
 * - 请求方法：POST（发布）、GET（获取列表）
 * - 请求路径：/api/article（通过 Vite 代理转发到后端 /article）
 * - 认证要求：需要有效的 JWT Token（自动注入）
 * - 响应格式：标准 Result 对象 { code, data, msg }
 * 
 * 使用场景：
 * - 首页文章列表展示
 * - 用户发布新文章
 * - 文章内容管理
 */

// 导入统一的请求工具
import request from '../utils/request'

// API基础URL配置
// 使用/api前缀，通过Vite代理转发到后端
const BASE_URL = '/api/article'

/**
 * 发布文章接口
 * 
 * 参数说明：
 * @param {Object} data - 文章数据对象
 * @param {string} data.title - 文章标题
 * @param {string} data.content - 文章内容
 * @param {string} [data.author] - 作者（可选，通常从Token中获取）
 * @param {string} [data.category] - 分类（可选）
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 创建的文章对象（包含ID、创建时间等）
 * - msg: 消息描述
 * 
 * 认证要求：
 * - 需要有效的 JWT Token
 * - Token 自动从 localStorage 获取并注入到请求头
 * 
 * 错误处理：
 * - 401: 未授权（Token无效或过期）
 * - 400: 请求参数错误
 * - 500: 服务器内部错误
 */
export function addArticle(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data: data
  })
}

/**
 * 获取文章列表接口
 * 
 * 参数说明：
 * - 无参数（获取所有文章列表）
 * - 可扩展支持分页、筛选等参数
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 文章列表数组
 * - msg: 消息描述
 * 
 * 数据结构：
 * - 每篇文章包含：id, title, content, author, createTime, updateTime 等字段
 * 
 * 认证要求：
 * - 需要有效的 JWT Token（某些场景可能允许公开访问）
 * - Token 自动注入到请求头
 */
export function getArticleList() {
  return request({
    url: BASE_URL,
    method: 'get',
  })
}