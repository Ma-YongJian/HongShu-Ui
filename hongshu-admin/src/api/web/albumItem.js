import request from '@/utils/request'

export function getSubjectItemList(params) {
  return request({
    url: '/albumItem/getList',
    method: 'post',
    data: params
  })
}

export function addSubjectItemList(params) {
  return request({
    url:'/albumItem/add',
    method: 'post',
    data: params
  })
}

export function editSubjectItem(params) {
  return request({
    url: '/albumtItem/edit',
    method: 'post',
    data: params
  })
}

export function deleteBatchSubjectItem(params) {
  return request({
    url: '/albumItem/deleteBatch',
    method: 'post',
    data: params
  })
}

export function sortByCreateTime(params) {
  return request({
    url: '/albumItem/sortByCreateTime',
    method: 'post',
    data: params
  })
}


