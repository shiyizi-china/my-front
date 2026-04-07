import request from '@/utils/request'

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} 用户信息对象
 */
export function getUserInfoApi() {
  return request.get('/users/me')
}

/**
 * 上传用户头像
 * @param {FormData} formData - 包含图片文件的FormData对象
 * @returns {Promise<Object>} 上传结果对象
 */
export function uploadAvatarApi(formData) {
  return request.post('/user/avatar', formData)
}