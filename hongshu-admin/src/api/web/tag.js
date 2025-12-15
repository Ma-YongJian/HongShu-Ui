import request from '@/utils/request'

// 查询会员列表
export function listTag(query) {
  return request({
    url: '/tag/list',
    method: 'get',
    params: query
  })
}

// 查询会员详细
export function getTag(id) {
  return request({
    url: '/tag/' + id,
    method: 'get'
  })
}

// 新增会员
export function addTag(data) {
  return request({
    url: '/tag',
    method: 'post',
    data: data
  })
}

// 修改会员
export function updateTag(data) {
  return request({
    url: '/tag',
    method: 'put',
    data: data
  })
}

// 删除会员
export function delTag(id) {
  return request({
    url: '/tag/' + id,
    method: 'delete'
  })
}
