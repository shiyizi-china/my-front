import request from '@/utils/request'

export interface UserInfoResponse {
  username: string
  name?: string
  id?: number
  avatar?: string
}

interface UploadAvatarResponse {
  avatarUrl?: string
  avatar?: string
}

/**
 * 获取当前用户信息
 * @returns {Promise<UserInfoResponse>} 用户信息对象
 */
export function getUserInfoApi(): Promise<UserInfoResponse> {
  return request.get('/users/me')
}

/**
 * 上传用户头像
 * @param {FormData} formData - 包含图片文件的FormData对象
 * @returns {Promise<UploadAvatarResponse>} 上传结果对象
 */
export function uploadAvatarApi(formData: FormData): Promise<UploadAvatarResponse> {
  return request.post('/user/avatar', formData)
}