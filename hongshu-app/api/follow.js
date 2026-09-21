import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'

function pickFollowerId(data) {
	if (data == null) return ''
	if (typeof data === 'string' || typeof data === 'number') return String(data)
	return data.followerId || data.fid || ''
}

export function followUser(data) {
	return request.get(appConfig.WEB_API + `/web/follower/followById`, {
		followerId: pickFollowerId(data)
	})
}

export function clearFollow(data) {
	return followUser(data)
}

export function isFollow(params) {
	return request.get(appConfig.WEB_API + `/web/follower/isFollow`, {
		followerId: pickFollowerId(params)
	})
}

export function getFollow(page, limit) {
	return request.get(appConfig.WEB_API + `/web/follower/getFollowTrend/${page}/${limit}`)
}

export function getAllFriend(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/follower/getFriend/${page}/${limit}`, params)
}
