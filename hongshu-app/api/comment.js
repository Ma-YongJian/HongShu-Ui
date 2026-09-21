import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'

export function addComment(data) {
	const payload = {
		nid: data.nid || data.mid || data.noteId,
		noteUid: data.noteUid,
		pid: data.pid == null || data.pid === 0 || data.pid === '0' ? '0' : String(data.pid),
		replyId: data.replyId == null || data.replyId === 0 ? '0' : String(data.replyId),
		replyUid: data.replyUid == null || data.replyUid === 0 ? '0' : String(data.replyUid),
		level: data.level || 1,
		content: data.content
	}
	return request.post(appConfig.WEB_API + '/web/comment/saveCommentByDTO', payload)
}

export function getAllTwoCommentByOneId(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/comment/getTwoCommentByOneCommentId/${page}/${limit}`, {
		oneCommentId: (params && (params.oneCommentId || params.id || params.cid)) || ''
	})
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
	return request.get(appConfig.WEB_API + '/web/comment/deleteCommentById', {
		commentId: (params && (params.commentId || params.id)) || ''
	})
}