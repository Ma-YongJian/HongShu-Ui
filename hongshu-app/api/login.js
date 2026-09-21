import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function login(data) {
	return request.post(appConfig.WEB_API + '/web/auth/login', data)
}

export function loginOut(params) {
	return request.get(appConfig.WEB_API + '/web/auth/loginOut', params)
}

export function updatePassword(data) {
	return request.post(appConfig.WEB_API + '/web/auth/updatePassword', data)
}

export function loginByCode(data) {
	return request.post(appConfig.WEB_API + '/web/auth/loginByCode', data)
}

export function otherLogin(data) {
	return request.post(appConfig.WEB_API + '/web/auth/otherLogin', data)
}