import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function getAllFollowTrends(page, limit, params) {
	return request.get(appConfig.WEB_API + `/web/follower/getFollowTrend/${page}/${limit}`, params)
}