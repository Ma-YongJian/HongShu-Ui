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
	return request.get(appConfig.WEB_API + '/web/album/getAlbumById', {
		albumId: (params && (params.albumId || params.id)) || params
	})
}


export function addAlbumImgRelation(data) {
	return request.post(appConfig.WEB_API + '/web/albumNoteRelation/addAlbumNoteRelation', {
		aid: data && (data.aid || data.albumId),
		nid: data && (data.nid || data.mid || data.noteId)
	})
}


export function isCollectImgToAlbum(params) {
	const noteId = params && (params.nid || params.mid || params.likeOrCollectionId || params.noteId)
	return request.post(appConfig.WEB_API + '/web/likeOrCollection/isLikeOrCollection', {
		likeOrCollectionId: noteId,
		type: 3
	})
}

export function deleteAlbumImgRelation(data) {
	return request.post(appConfig.WEB_API + '/web/albumNoteRelation/deleteAlbumNoteRelation', {
		aid: data && (data.aid || data.albumId),
		nid: data && (data.nid || data.mid || data.noteId)
	})
}



export function deleteAlbum(params) {
	return request.get(appConfig.WEB_API + '/web/album/deleteAlbum', params)
}