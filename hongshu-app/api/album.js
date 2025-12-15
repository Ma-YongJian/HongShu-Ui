import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function saveAlbum(albumInfo) {
	return request.post(appConfig.WEB_API + '/web/album/saveAlbum', albumInfo)
}

export function updateAlbum(albumInfo) {
	return request.post(appConfig.WEB_API + '/web/album/updateAlbum', albumInfo)
}

export function getAllAlbum(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/album/getAlbumByUserId/${page}/${limit}`, params)
}

export function getAlbum(params) {
	return request.get(appConfig.WEB_API + '/web/album/getAlbum', params)
}


export function addAlbumImgRelation(data) {
	return request.post(appConfig.WEB_API + '/web/albumImgRelation/addAlbumImgRelation', data)
}


export function isCollectImgToAlbum(params) {
	return request.get(appConfig.WEB_API + '/web/albumImgRelation/isCollectImgToAlbum', params)
}

export function deleteAlbumImgRelation(data) {
	return request.post(appConfig.WEB_API + '/web/albumImgRelation/deleteAlbumImgRelation', data)
}



export function deleteAlbum(params) {
	return request.get(appConfig.WEB_API + '/web/album/deleteAlbum', params)
}