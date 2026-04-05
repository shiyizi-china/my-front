import request from '../utils/request'

// 发布文章
export function addArticle(data) {
  return request({
    url: '/api/article',
    method: 'post',
    data: data
  })
}

// 获取文章列表
export function getArticleList() {
  return request({
    url: '/api/article',
    method: 'get'
  })
}