import request from '../utils/request'

// 获取弹幕
export function getBarrageList() {
  return request.get('/barrage')
}

// 发送弹幕
export function sendBarrage(data) {
  return request.post('/barrage', data)
}