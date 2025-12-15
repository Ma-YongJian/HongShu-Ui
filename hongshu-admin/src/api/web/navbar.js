import request from '@/utils/request'

// 查询导航栏列表
export function listNavbar(query) {
  return request({
    url: '/navbar/list',
    method: 'get',
    params: query
  })
}

// 查询导航栏详细
export function getNavbar(id) {
  return request({
    url: '/navbar/' + id,
    method: 'get'
  })
}

// 查询导航栏下拉树结构
export function treeSelect(query) {
  return request({
    url: '/navbar/treeSelect',
    method: 'get',
    params: query
  })
}

// 查询导航栏下拉树结构
export function navbarTreeSelect() {
  return request({
    url: '/navbar/navbarTreeSelect' ,
    method: 'get'
  })
}

// 新增导航栏
export function addNavbar(data) {
  return request({
    url: '/navbar',
    method: 'post',
    data: data,
    headers: { "Content-Type": "multipart/form-data;boundary=----WebKitFormBoundaryk4ZvuPo6pkphe7Pl" },
  })
}

// 修改导航栏
export function updateNavbar(data) {
  return request({
    url: '/navbar',
    method: 'put',
    data: data,
    headers: { "Content-Type": "multipart/form-data;boundary=----WebKitFormBoundaryk4ZvuPo6pkphe7Pl" },
  })
}

// 删除导航栏
export function delNavbar(id) {
  return request({
    url: '/navbar/' + id,
    method: 'delete'
  })
}