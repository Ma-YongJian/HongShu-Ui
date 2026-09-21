import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function saveTag(tagInfo) {
	return request.post(appConfig.WEB_API + '/web/tag/getTagByKeyword/1/1', tagInfo)
}


export function getAllTag(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/tag/getTagByKeyword/${page}/${limit}`, params)
}


export function getImgListByTagId(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/tag/getNoteByTagId/${page}/${limit}`, {
		tagId: (params && (params.tagId || params.id)) || '',
		type: params && params.type
	})
}


export function getOneTag(params) {
	return request.get(appConfig.WEB_API + '/web/tag/getTagById', {
		tagId: (params && (params.tagId || params.id)) || params
	})
}
