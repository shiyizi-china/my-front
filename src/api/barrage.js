/**
 * src/api/barrage.js - 弹幕管理 API 封装
 * 
 * 功能说明：
 * - 封装弹幕获取和发送接口
 * - 集成统一的请求工具和认证机制
 * - 支持实时弹幕交互
 * 
 * 接口规范：
 * - 获取接口：GET /barrage（相对路径，自动适配环境）
 * - 发送接口：POST /barrage（相对路径，自动适配环境）
 * - 认证要求：需要有效的 JWT Token（自动注入）
 * - 响应格式：标准 Result 对象 { code, data, msg }
 */

// 导入统一的请求工具（基于 axios）
import request from '@/utils/request'

/**
 * 获取弹幕列表
 * 
 * 功能说明：
 * - 获取所有可用的弹幕消息
 * - 返回弹幕内容、发送者、时间等信息
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 弹幕列表数组
 * - msg: 消息描述
 * 
 * 认证要求：
 * - 需要有效的 JWT Token
 * - Token 自动注入到请求头
 */
export function getBarrageList() {
  return request.get('/barrage')
}

/**
 * 发送弹幕
 * 
 * 参数说明：
 * @param {Object} data - 弹幕数据对象
 * @param {string} data.content - 弹幕内容
 * @param {string} [data.color] - 弹幕颜色（可选）
 * @param {number} [data.position] - 弹幕位置（可选）
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 发送结果
 * - msg: 消息描述
 * 
 * 认证要求：
 * - 需要有效的 JWT Token
 * - Token 自动注入到请求头
 */
export function sendBarrage(data) {
  return request.post('/barrage', data)
}