import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function followUser(data) {
	return request.post(appConfig.WEB_API + `/web/app/follow/followUser`, data)
}

export function clearFollow(data) {
	return request.post(appConfig.WEB_API + `/web/follow/clearFollow`, data)
}

export function isFollow(params) {
	return request.get(appConfig.WEB_API + `/web/follower/isFollow`, params)
}

export function getFollow(page, limit) {
	return request.get(appConfig.WEB_API + `/web/follower/getFollowTrend/${page}/${limit}`)
}

export function getAllFriend(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/follower/getFriend/${page}/${limit}`, params)
}