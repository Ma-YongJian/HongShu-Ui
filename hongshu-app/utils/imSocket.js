import { appConfig } from '@/config/config.js'
import { tokenUtil } from '@/utils/token.js'

let socketTask = null
let listeners = []
let opened = false
let currentUid = ''

export function buildWsUrl(uid) {
	const token = tokenUtil.get() || ''
	const query = token ? ('?token=' + encodeURIComponent(token)) : ''
	const api = (appConfig.WEB_API || '').replace(/\/$/, '')
	if (api) {
		const wsBase = api.replace(/^https/i, 'wss').replace(/^http/i, 'ws')
		return wsBase + '/web/ws/' + uid + query
	}
	let base = appConfig.WS_API || ''
	if (base.indexOf('ws') !== 0) {
		base = 'ws://' + base
	}
	if (base.charAt(base.length - 1) !== '/') {
		base += '/'
	}
	return base + uid + query
}

function currentUserId() {
	return tokenUtil.getUserId() || (uni.getStorageSync('userInfo') || {}).id || ''
}

function dispatch(data) {
	listeners.slice().forEach((fn) => {
		try {
			fn(data)
		} catch (e) {}
	})
}

function ensureConnected() {
	const uid = currentUserId()
	if (!uid) return
	if (opened && socketTask && currentUid === String(uid)) return
	if (socketTask) {
		try {
			socketTask.close()
		} catch (e) {}
		socketTask = null
		opened = false
	}
	currentUid = String(uid)
	socketTask = uni.connectSocket({
		url: buildWsUrl(currentUid),
		complete: () => {}
	})
	if (!socketTask) return
	socketTask.onOpen(() => {
		opened = true
	})
	socketTask.onMessage((res) => {
		dispatch(res && res.data)
	})
	socketTask.onClose(() => {
		opened = false
		socketTask = null
	})
	socketTask.onError(() => {
		opened = false
	})
}

export function subscribeIm(handler) {
	if (typeof handler === 'function' && listeners.indexOf(handler) < 0) {
		listeners.push(handler)
	}
	ensureConnected()
	return function unsubscribe() {
		listeners = listeners.filter((fn) => fn !== handler)
	}
}

export function parseImPayload(raw) {
	if (raw == null || raw === '') return null
	if (typeof raw === 'object') return raw
	try {
		return JSON.parse(raw)
	} catch (e) {
		return null
	}
}
