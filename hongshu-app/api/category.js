import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function getCategory() {
	return request.get(appConfig.WEB_API + '/web/category/getCategoryTreeData', null)
}


export function getImgListByCategory(page, limit, params) {
	return request.post(appConfig.WEB_API + `/web/es/note/getNoteByDTO/${page}/${limit}`, params)
}