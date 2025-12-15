import request from '@/utils/request'

export function getSystemConfig(params) {
  return request({
    url: '/systemConfig/getSystemConfig',
    method: 'get',
    params
  })
}

export function cleanRedisByKey(params) {
  return request({
    url: '/systemConfig/cleanRedisByKey',
    method: 'post',
    data: params
  })
}

export function editSystemConfig(params) {
  return request({
    url: '/systemConfig/editSystemConfig',
    method: 'post',
    data: params
  })
}
