import request from '@/utils/request'

// 查询会员列表
export function listComment(query) {
  return request({
    url: '/comment/list',
    method: 'get',
    params: query
  })
}

// 查询会员详细
export function getComment(id) {
  return request({
    url: '/comment/' + id,
    method: 'get'
  })
}

// 查询会员详细
export function getCommentByNid(nid) {
  return request({
    url: '/comment/list/' + nid,
    method: 'get'
  })
}

// 删除会员
export function delComment(id) {
  return request({
    url: '/comment/' + id,
    method: 'delete'
  })
}
