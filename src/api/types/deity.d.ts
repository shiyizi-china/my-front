/**
 * Deity 模块类型定义
 */

export interface DeityMember {
  id?: number
  username: string
  password: string
  name: string
  gender: string
  Clazz: string
  birthday: string // YYYY-MM-DD 格式
  phone: string
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  msg: string
}