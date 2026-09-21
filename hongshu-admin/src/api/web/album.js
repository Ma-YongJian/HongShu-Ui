import request from '@/utils/request'

export function getSubjectList(query) {
  return request({
    url: '/album/list',
    method: 'get',
    params: query
  })
}

export function addSubject(params) {
  return request({
    url: '/album',
    method: 'post',
    data: params
  })
}

export function editSubject(params) {
  return request({
    url: '/album',
    method: 'put',
    data: params
  })
}

export function deleteBatchSubject(ids) {
  return request({
    url: '/album/' + ids,
    method: 'delete'
  })
}
