import request from '@/utils/request'

export function pictureSpider(params) {
  return request({
    url: '/spider/spiderPicture',
    method: 'post',
    data: params
  })
}

