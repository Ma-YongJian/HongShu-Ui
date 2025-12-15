import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function esSearch(page, limit, data) {
	return request.post(appConfig.WEB_API + `/web/es/note/getNoteByDTO/${page}/${limit}`, data)
}


export function addSearchRecordData(params) {
	return request.post(appConfig.WEB_API + `/web/es/record/addRecord`, params)
}


export function esSearchRecord(params) {
	return request.get(appConfig.WEB_API + `/web/es/record/getHotRecord`, params)
}