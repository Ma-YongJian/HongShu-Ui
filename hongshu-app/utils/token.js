import {appConfig} from '../config/config.js'

export const tokenUtil = {
    set: (s) => {
        uni.setStorageSync(appConfig.tokenKey, s)
    },
    get: () => {
        return uni.getStorageSync(appConfig.tokenKey)
    },
    clear: () => {
        uni.removeStorageSync(appConfig.tokenKey)
    },
	
	// 设置 userId 方法
	setUserId: (userId) => {
		uni.setStorageSync(appConfig.userKey, userId);
	},
	
	// 获取 userId 方法
	getUserId: () => {
		return uni.getStorageSync(appConfig.userKey);
	},
	
	// 清除 userId 方法
	clearUserId: () => {
		uni.removeStorageSync(appConfig.userKey);
	}
}