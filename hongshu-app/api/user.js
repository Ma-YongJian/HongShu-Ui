import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function getMe(params) {
	return request.get(appConfig.WEB_API + `/web/user/getUserById`, {
		userId: (params && (params.userId || params.id)) || ''
	})
}


export function getTrendByUser(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/user/getTrendByUser/${page}/${limit}`, params)
}

export function getUserInfo(params) {
	return request.get(appConfig.WEB_API + `/web/user/getUserById`, params)
}


export function updateUser(data) {
	return request.post(appConfig.WEB_API + '/web/user/updateUser', data)
}

export function searchUser(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/user/getUserByKeyword/${page}/${limit}`, params)
}

export function searchUserByUsername(params) {
	return request.get(appConfig.WEB_API + '/web/user/searchUserByUsername', params)
}

export function getUserRecord(params) {
	return request.get(appConfig.WEB_API + `/web/im/chat/getCountMessage`, params).then((res) => {
		if (res && res.data) {
			const d = res.data
			res.data = Object.assign({}, d, {
				agreeCollectionCount: d.agreeCollectionCount || d.likeOrCollectionCount || 0,
				addFollowCount: d.addFollowCount || d.followCount || 0,
				noreplyCount: d.noreplyCount || d.commentCount || 0
			})
		}
		return res
	})
}

export function clearUserRecord(params) {
	const typeMap = { 1: 0, 2: 2, 3: 1 }
	const type = params && params.type
	return request.get(appConfig.WEB_API + `/web/im/chat/clearMessageCount`, {
		sendUid: (params && (params.sendUid || params.uid)) || '',
		type: typeMap[type] != null ? typeMap[type] : type
	})
}