import request from '@/utils/request'

// 查询会员列表
export function listNote(query) {
  return request({
    url: '/note/list',
    method: 'get',
    params: query
  })
}

// 查询未审核笔记列表
export function unAuditListNote(query) {
  return request({
    url: '/note/unAuditList',
    method: 'get',
    params: query
  })
}

// 查询会员详细
export function getNote(id) {
  return request({
    url: '/note/' + id,
    method: 'get'
  })
}

// 新增会员
export function addNote(data) {
  return request({
    url: '/note',
    method: 'post',
    data: data
  })
}

// 修改会员
export function updateNote(data) {
  return request({
    url: '/note',
    method: 'put',
    data: data
  })
}

// 删除会员
export function delNote(id) {
  return request({
    url: '/note/' + id,
    method: 'delete'
  })
}

// 审核笔记
export function auditNote(data) {
  return request({
    url: '/note/auditNote',
    method: 'put',
    data: data
  })
}

// ES重置
export function refreshNoteDate() {
  return request({
    url: 'web/es/note/refreshNoteData',
    method: 'post',
  })
}
