import request from '../utils/request'

const BASE_URL = '/image'

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: BASE_URL,
    method: 'post',
    data: formData,
  })
}

export function getImageList() {
  return request({
    url: BASE_URL,
    method: 'get',
  })
}