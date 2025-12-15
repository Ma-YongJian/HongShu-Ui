import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'


export function login(data) {
	return request.post(appConfig.WEB_API + '/web/auth/login', data)
}

export function loginOut(data) {
	return request.post(appConfig.WEB_API + '/web/auth/loginOut', data)
}

export function loginByCode(data) {
	return request.post(appConfig.WEB_API + '/web/auth/loginByCode', data)
}

export function otherLogin(data) {
	return request.post(appConfig.WEB_API + '/web/auth/otherLogin', data)
}