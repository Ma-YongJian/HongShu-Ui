import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function getZimToken(params) {
	return request.get(appConfig.WEB_API + '/web/getZimToken', params)
}


export function getChatUserList(params) {
	return request.get(appConfig.WEB_API + '/web/im/chat/getChatUserList', params)
}

export function addChatRecord(data) {
	return request.post(appConfig.WEB_API + '/web/im/chat/sendMsg', data)
}


export function getChatRecord(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/im/chat/getAllChatRecord/${page}/${limit}`, params)
}

export function updateRecordCount(params) {
	return request.get(appConfig.WEB_API + `/web/chat/updateRecordCount`, params)
}

export function deleteRecord(params) {
	return request.get(appConfig.WEB_API + `/web/chat/deleteRecord`, params)
}