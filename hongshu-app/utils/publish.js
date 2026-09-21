import { tokenUtil } from '@/utils/token.js'

const TAB_MAP = {
	'pages/index/index': '/pages/index/index',
	'pages/index/interest/interest': '/pages/index/interest/interest',
	'pages/message/message': '/pages/message/message',
	'pages/user/user': '/pages/user/user'
}

export function rememberTab(route) {
	const path = TAB_MAP[route]
	if (path) {
		uni.setStorageSync('lastTabPath', path)
	}
}

export function lastTabPath() {
	return uni.getStorageSync('lastTabPath') || '/pages/index/index'
}

export function goLogin() {
	uni.navigateTo({
		url: '/pages/login/login'
	})
}

export function goPushPage() {
	uni.navigateTo({
		url: '/pages/push/push'
	})
}

export function startPublish() {
	if (!tokenUtil.get()) {
		goLogin()
		return
	}
	uni.chooseImage({
		count: 9,
		sizeType: ['compressed', 'original'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			const paths = res.tempFilePaths || []
			uni.setStorageSync('imgList', JSON.stringify(paths))
			uni.removeStorageSync('tags')
			uni.removeStorageSync('imgInfo')
			goPushPage()
		}
	})
}
