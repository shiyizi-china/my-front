export interface UserInfoResponse {
  username: string
  id?: number
  avatar?: string
}

export interface UploadAvatarResponse {
  avatarUrl?: string
  avatar?: string
}

export function getUserInfoApi(): Promise<{
  code: number
  data: UserInfoResponse
  msg: string
}>

export function uploadAvatarApi(formData: FormData): Promise<{
  code: number
  data: UploadAvatarResponse
  msg: string
}>