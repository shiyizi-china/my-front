import request from '@/utils/request'

// API基础URL配置
const BASE_URL = '/api/deitys' // 使用/api前缀，通过Vite代理转发到后端

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
 * @returns {Promise<Object>} 包含code、data、msg的响应对象
 */
export function getDeityList() {
  return request({
    url: BASE_URL,
    method: 'get',
  })
}

/**
 * 新增Deity成员
 * @param {DeityMember} data - 成员数据
 * @returns {Promise<Object>} 包含code、data、msg的响应对象
 */
export function addDeity(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data,
  })
}

/**
 * 更新Deity成员信息
 * @param {DeityMember} data - 更新的数据（包含id）
 * @returns {Promise<Object>} 包含code、data、msg的响应对象
 */
export function updateDeity(data) {
  return request({
    url: `${BASE_URL}/${data.id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除Deity成员
 * @param {number} id - 成员ID
 * @returns {Promise<Object>} 包含code、data、msg的响应对象
 */
export function deleteDeity(id) {
  return request({
    url: `${BASE_URL}/${id}`,
    method: 'delete',
  })
}