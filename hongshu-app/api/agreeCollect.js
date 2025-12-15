import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function agree(data) {
	return request.post(appConfig.WEB_API + '/web/likeOrCollection/likeOrCollectionByDTO', data)
}

export function cancelAgree(data) {
	return request.post(appConfig.WEB_API + '/web/likeOrCollection/likeOrCollectionByDTO', data)
}

export function isAgree(data) {
	return request.post(appConfig.WEB_API + '/web/likeOrCollection/isLikeOrCollection', data)
}

export function isAgrees(data) {
	return request.post(appConfig.WEB_API + '/web/likeOrCollection/isLikeOrCollections', data)
}

export function getAllAgreeAndCollection(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/likeOrCollection/getNoticeLikeOrCollection/${page}/${limit}`, params)
}

export function getAllCollection(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/user/getTrendByUser/${page}/${limit}`, params)
}


export function collection(data) {
	return request.post(appConfig.WEB_API + '/web/agreeCollect/collection', data)
}

export function cancelCollection(data) {
	return request.post(appConfig.WEB_API + '/web/agreeCollect/cancelCollection', data)
}