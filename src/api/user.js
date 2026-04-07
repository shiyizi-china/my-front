import request from '@/utils/request'

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} 用户信息对象
 */
export function getUserInfoApi() {
  return request.get('/user/me')
}

/**
 * 上传用户头像
 * @param {FormData} formData - 包含图片文件的FormData对象
 * @returns {Promise<Object>} 上传结果对象
 */
export function uploadAvatarApi(formData) {
  // 使用专用的 /user/avatar 接口
  return request.post('/user/avatar', formData)
}