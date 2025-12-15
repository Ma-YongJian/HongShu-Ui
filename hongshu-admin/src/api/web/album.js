import request from '@/utils/request'

export function getSubjectList(query) {
  return request({
    url: '/album/list',
    method: 'get',
    data: query
  })
}

export function addSubject(params) {
  return request({
    url: '/album/add',
    method: 'post',
    data: params
  })
}

export function editSubject(params) {
  return request({
    url: '/album/edit',
    method: 'put',
    data: params
  })
}

export function deleteBatchSubject(params) {
  return request({
    url: '/album/deleteBatch',
    method: 'delete',
    data: params
  })
}


