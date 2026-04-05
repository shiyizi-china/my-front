/**
 * src/api/home.js - 首页图片管理 API 封装
 * 
 * 功能说明：
 * - 封装图片上传和获取接口
 * - 支持 FormData 文件上传
 * - 集成统一的请求工具
 * - 处理文件上传的特殊 Content-Type 要求
 * 
 * 接口规范：
 * - 上传接口：POST /image（通过 Vite 代理转发到后端 /image）
 * - 获取接口：GET /image（通过 Vite 代理转发到后端 /image）
 * - 认证要求：需要有效的 JWT Token（自动注入）
 * - 文件格式：支持常见的图片格式（jpg, png, gif 等）
 * 
 * 技术特性：
 * - FormData 自动处理
 * - Content-Type 自动移除（让浏览器设置 boundary）
 * - 文件大小和类型验证（后端实现）
 */

// 导入统一的请求工具
import request from '../utils/request'

// API基础URL配置
// 直接使用 /image 路径，通过Vite代理转发到后端
const BASE_URL = '/image'

/**
 * 上传图片接口
 * 
 * 参数说明：
 * @param {File} file - 要上传的图片文件对象
 * - 支持 File 或 Blob 类型
 * - 通常来自 input[type="file"] 元素
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 上传结果（包含图片URL、文件名等信息）
 * - msg: 消息描述
 * 
 * 技术实现：
 * - 使用 FormData 封装文件
 * - 自动移除 Content-Type 头，让浏览器设置正确的 boundary
 * - 支持大文件上传（依赖后端配置）
 * 
 * 错误处理：
 * - 400: 文件格式不支持或文件过大
 * - 401: 未授权上传
 * - 500: 服务器内部错误
 */
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: BASE_URL,
    method: 'post',
    data: formData,
  })
}

/**
 * 获取图片列表接口
 * 
 * 功能说明：
 * - 获取所有已上传的图片列表
 * - 返回图片的元数据（URL、上传时间、文件名等）
 * - 支持分页和排序（当前未实现）
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 图片列表数组
 * - msg: 消息描述
 * 
 * 数据结构：
 * - 每张图片包含：id, url, filename, uploadTime, size 等字段
 * 
 * 认证要求：
 * - 需要有效的 JWT Token
 * - Token 自动注入到请求头
 * 
 * 错误处理：
 * - 401: 未授权访问
 * - 500: 服务器内部错误
 */
export function getImageList() {
  return request({
    url: BASE_URL,
    method: 'get',
  })
}