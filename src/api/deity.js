/**
 * src/api/deity.js - 成员管理 API 封装
 * 
 * 功能说明：
 * - 封装 Deity 成员的完整 CRUD 操作
 * - 提供类型安全的参数和响应定义
 * - 集成统一的请求工具和认证机制
 * - 支持成员信息的增删改查操作
 * 
 * 接口规范：
 * - 请求路径：/deitys（相对路径，自动适配环境）
 * - 认证要求：需要有效的 JWT Token（自动注入）
 * - 响应格式：标准 Result 对象 { code, data, msg }
 * - 数据结构：遵循 DeityMember 接口定义
 * 
 * 使用场景：
 * - 成员列表展示和管理
 * - 新成员注册和信息维护
 * - 成员信息更新和删除
 */

// 导入统一的请求工具
import request from '@/utils/request'

// API基础URL配置 - 使用相对路径
const DEITY_URL = '/deitys'

/**
 * Deity 成员数据结构类型定义
 * 
 * 字段说明：
 * @typedef {Object} DeityMember
 * @property {number} id - 成员ID（主键，自增）
 * @property {string} username - 账号（唯一标识，登录使用）
 * @property {string} password - 密码（加密存储）
 * @property {string} name - 姓名（显示名称）
 * @property {string} gender - 性别（男/女/其他）
 * @property {string} Clazz - 班级（学生分组信息）
 * @property {string} birthday - 生日 (YYYY-MM-DD 格式)
 * @property {string} phone - 手机号（联系方式）
 * 
 * 数据验证：
 * - username: 必填，唯一
 * - password: 必填，服务端加密
 * - name: 必填
 * - 其他字段：可选，根据业务需求
 */
/**
 * Deity 成员数据结构类型定义
 * @typedef {Object} DeityMember
 * @property {number} id - 成员ID
 * @property {string} username - 账号
 * @property {string} password - 密码
 * @property {string} name - 姓名
 * @property {string} gender - 性别
 * @property {string} Clazz - 班级
 * @property {string} birthday - 生日 (YYYY-MM-DD)
 * @property {string} phone - 手机号
 */

/**
 * 获取所有Deity成员列表
 * 
 * 功能说明：
 * - 获取完整的成员列表
 * - 支持分页、排序、筛选等扩展（当前未实现）
 * - 返回所有成员的基本信息
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 成员列表数组（DeityMember[]）
 * - msg: 消息描述
 * 
 * 认证要求：
 * - 需要有效的 JWT Token
 * - Token 自动从 localStorage 获取并注入
 * 
 * 错误处理：
 * - 401: 未授权访问
 * - 403: 权限不足
 * - 500: 服务器内部错误
 */
export function getDeityList() {
  return request({
    url: DEITY_URL,
    method: 'get',
  })
}

/**
 * 新增Deity成员
 * 
 * 参数说明：
 * @param {DeityMember} data - 成员数据对象
 * - 必填字段：username, password, name
 * - 可选字段：gender, Clazz, birthday, phone
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 创建的成员对象（包含分配的ID）
 * - msg: 消息描述
 * 
 * 业务规则：
 * - username 必须唯一
 * - password 在服务端加密存储
 * - 成功创建后返回完整成员信息
 * 
 * 错误处理：
 * - 400: 参数验证失败（如用户名已存在）
 * - 401: 未授权
 * - 500: 服务器内部错误
 */
export function addDeity(data) {
  return request({
    url: DEITY_URL,
    method: 'post',
    data,
  })
}

/**
 * 更新Deity成员信息
 * 
 * 参数说明：
 * @param {DeityMember} data - 更新的数据对象
 * - 必须包含 id 字段（用于标识要更新的成员）
 * - 其他字段为要更新的内容
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 更新后的成员对象
 * - msg: 消息描述
 * 
 * 业务规则：
 * - 只能更新自己的信息或管理员更新他人信息
 * - username 通常不允许修改（避免冲突）
 * - 密码更新需要特殊处理（当前接口可能不支持）
 * 
 * 错误处理：
 * - 400: 参数验证失败
 * - 401: 未授权
 * - 404: 成员不存在
 * - 500: 服务器内部错误
 */
export function updateDeity(data) {
  return request({
    url: `${DEITY_URL}/${data.id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除Deity成员
 * 
 * 参数说明：
 * @param {number} id - 成员ID（要删除的成员标识）
 * 
 * 响应说明：
 * @returns {Promise<Object>} 包含以下字段的响应对象：
 * - code: 状态码（1=成功，其他=失败）
 * - data: 删除操作结果（通常为空或简单确认信息）
 * - msg: 消息描述
 * 
 * 业务规则：
 * - 通常只能删除自己或管理员删除他人
 * - 删除操作不可逆，需谨慎处理
 * - 可能需要二次确认（前端实现）
 * 
 * 错误处理：
 * - 401: 未授权
 * - 403: 权限不足
 * - 404: 成员不存在
 * - 500: 服务器内部错误
 */
export function deleteDeity(id) {
  return request({
    url: `${DEITY_URL}/${id}`,
    method: 'delete',
  })
}