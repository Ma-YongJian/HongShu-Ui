import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function getAllSearchRecord(params) {
	return request.get(appConfig.WEB_API + '/web/es/record/getRecordByKeyWord', params)
}

export function addSearchRecord(params) {
	return request.post(appConfig.WEB_API + '/web/es/record/addRecord', params)
}

export function deleteSearchRecord(params) {
	return request.post(appConfig.WEB_API + '/web/es/record/clearRecord', params)
}