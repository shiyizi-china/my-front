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

interface ApiResponse<T> {
  code: number
  data: T
  msg: string
}

/**
 * 获取当前用户信息
 * @returns {Promise<ApiResponse<UserInfoResponse>>} 包含用户信息的响应对象
 */
export function getUserInfoApi(): Promise<ApiResponse<UserInfoResponse>> {
  return request({
    url: '/api/users/me',
    method: 'get'
  })
}

/**
 * 上传用户头像
 * @param {FormData} formData - 包含图片文件的FormData对象
 * @returns {Promise<ApiResponse<UploadAvatarResponse>>} 包含上传结果的响应对象
 */
export function uploadAvatarApi(formData: FormData): Promise<ApiResponse<UploadAvatarResponse>> {
  return request({
    url: '/api/user/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}