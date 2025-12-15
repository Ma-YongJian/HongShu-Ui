import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function publish(data) {
	return request.post(appConfig.WEB_API + '/web/app/note/saveNoteByDTO', data)
}

export function updateStatus(data) {
	return request.post(appConfig.WEB_API + '/web/app/imgDetail/updateStatus', data)
}


export function getAllImgByAlbum(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/imgDetail/getAllImgByAlbum/${page}/${limit}`, params)
}


export function getOne(params) {
	return request.get(appConfig.WEB_API + `/web/note/getNoteById`, params)
}


export function getPage(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/es/note/getRecommendNote/${page}/${limit}`, params)
}

export function getRecommend(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/es/note/getRecommendNote/${page}/${limit}`, params)
}

export function getRecommendUser(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/es/note/getRecommendUser/${page}/${limit}`, params)
}

export function deleteImgs(data, uid) {
	return request.post(appConfig.WEB_API + `/web/imgDetail/deleteImgs/${uid}`, data)
}

export function getHot(page, limit) {
	return request.get(appConfig.WEB_API + `/web/es/note/getHotNote/${page}/${limit}`, null)
}

export function updateImgDetail(data) {
	return request.post(appConfig.WEB_API + '/web/imgDetail/updateImgDetail', data)
}

export function addMQTask(data) {
	return request.post(appConfig.WEB_API + '/web/imgDetail/addMQTask', data)
}