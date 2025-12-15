import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'

export function addComment(data) {
	return request.post(appConfig.WEB_API + '/web/comment/addComment', data)
}

export function getAllTwoCommentByOneId(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/comment/getAllTwoCommentByOneId/${page}/${limit}`, params)
}


export function getAllOneCommentByImgId(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/comment/getAllOneCommentByImgId/${page}/${limit}`, params)
}

export function getAllTwoComment(params) {
	return request.get(appConfig.WEB_API + `/web/comment/getAllTwoComment`, params)
}


export function getAllReplyComment(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/comment/getNoticeComment/${page}/${limit}`, params)
}


export function getComment(params) {
	return request.get(appConfig.WEB_API + `/web/comment/getComment`, params)
}

export function scrollComment(params) {
	return request.get(appConfig.WEB_API + `/web/comment/scrollComment`, params)
}


export function getAllTrendCommentByImage(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/comment/getAllTrendCommentByImage/${page}/${limit}`, params)
}

export function getAllComment(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/comment/getCommentWithCommentByNoteId/${page}/${limit}`, params)
}

export function delComment(params) {
	return request.get(appConfig.WEB_API + `/web/comment/delComment`, params)
}