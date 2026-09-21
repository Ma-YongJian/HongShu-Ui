import request from '@/utils/request'

export function listLoginlog(query) {
  return request({
    url: '/loginInfo/list',
    method: 'get',
    params: query
  })
}

export function delLoginlog(infoIds) {
  return request({
    url: '/loginInfo/' + infoIds,
    method: 'delete'
  })
}

export function cleanLoginlog() {
  return request({
    url: '/loginInfo/clean',
    method: 'delete'
  })
}
