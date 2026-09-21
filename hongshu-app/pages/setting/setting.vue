<template>
	<view class="setting-page">
		<hs-nav-bar title="设置"></hs-nav-bar>

		<view class="cell-card">
			<view class="cell" @click="showPhone">
				<view class="cell-label">手机号</view>
				<view class="cell-value">{{ hidePhone }}</view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
			<view class="cell" @click="showEmail">
				<view class="cell-label">邮箱</view>
				<view class="cell-value">{{ hideEmail }}</view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
			<view class="cell cell-last" @click="updatePassword">
				<view class="cell-label">修改密码</view>
				<view class="cell-value"></view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
		</view>

		<view class="cell-card">
			<view class="cell" @click="openDeviceInfo">
				<view class="cell-label">设备信息</view>
				<view class="cell-value">{{ deviceDisplay || '查看' }}</view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
			<view class="cell" @click="openProject">
				<view class="cell-label">项目地址</view>
				<view class="cell-value">Gitee / GitHub</view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
			<view class="cell cell-last" @click="showIntro">
				<view class="cell-label">项目简介</view>
				<view class="cell-value"></view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
		</view>

		<view class="logout-btn" @click="loginOut">退出登录</view>
	</view>
</template>

<script>
	import { loginOut as logoutApi } from "@/api/login.js"
	import { getUserInfo } from "@/api/user.js"
	import { tokenUtil } from "@/utils/token.js"

	const GITEE_URL = 'https://gitee.com/Maverick_Ma/hongshu'
	const GITHUB_URL = 'https://github.com/Ma-YongJian/HongShu'

	export default {
		data() {
			return {
				userInfo: {},
				deviceDisplay: '',
				deviceDetail: '',
				appVersion: ''
			}
		},
		computed: {
			hidePhone() {
				const phone = (this.userInfo && this.userInfo.phone) || ''
				if (!phone) return '未绑定'
				return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
			},
			hideEmail() {
				const email = (this.userInfo && this.userInfo.email) || ''
				if (!email) return '未绑定'
				const at = email.indexOf('@')
				if (at < 1) return email
				const name = email.slice(0, at)
				const domain = email.slice(at)
				const keep = name.slice(0, 1)
				return keep + '***' + domain
			}
		},
		onLoad() {
			this.loadDeviceInfo()
		},
		onShow() {
			this.refreshUser()
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			refreshUser() {
				const cached = uni.getStorageSync("userInfo") || {}
				this.userInfo = cached
				if (!cached.id) return
				getUserInfo({
					userId: cached.id
				}).then(res => {
					if (res.code === 200 && res.data) {
						this.userInfo = Object.assign({}, cached, res.data)
						uni.setStorageSync("userInfo", this.userInfo)
					}
				})
			},
			joinBrandModel(brand, model) {
				const b = (brand || '').trim()
				const m = (model || '').trim()
				if (!b) return m
				if (!m) return b
				if (b.toLowerCase() === m.toLowerCase()) return m
				if (m.toLowerCase().indexOf(b.toLowerCase()) >= 0) return m
				return b + ' ' + m
			},
			loadDeviceInfo() {
				uni.getSystemInfo({
					success: (res) => {
						const name = this.joinBrandModel(res.deviceBrand || res.brand, res.deviceModel || res.model)
						const system = (res.system || '').trim()
						this.deviceDisplay = name || system
						this.deviceDetail = [name, system].filter(Boolean).join(' ')
						this.appVersion = res.appVersion || res.version || ''
					}
				})
			},
			showPhone() {
				const phone = (this.userInfo && this.userInfo.phone) || ''
				if (!phone) {
					uni.showToast({
						title: '未绑定手机号',
						icon: 'none'
					})
					return
				}
				uni.showModal({
					title: '绑定手机号',
					content: '当前绑定 ' + this.hidePhone,
					confirmText: '复制',
					cancelText: '关闭',
					success: (res) => {
						if (res.confirm) {
							uni.setClipboardData({
								data: phone
							})
						}
					}
				})
			},
			showEmail() {
				const email = (this.userInfo && this.userInfo.email) || ''
				if (!email) {
					uni.showToast({
						title: '未绑定邮箱',
						icon: 'none'
					})
					return
				}
				uni.showModal({
					title: '绑定邮箱',
					content: '当前绑定 ' + this.hideEmail,
					confirmText: '复制',
					cancelText: '关闭',
					success: (res) => {
						if (res.confirm) {
							uni.setClipboardData({
								data: email
							})
						}
					}
				})
			},
			updatePassword() {
				uni.navigateTo({
					url: "/pages/setting/updatePossword/updatePossword"
				})
			},
			openDeviceInfo() {
				uni.getSystemInfo({
					success: (res) => {
						const name = this.joinBrandModel(res.deviceBrand || res.brand, res.deviceModel || res.model)
						const system = (res.system || '').trim()
						this.deviceDisplay = name || system
						this.deviceDetail = [name, system].filter(Boolean).join(' ')
						this.appVersion = res.appVersion || res.version || ''
						uni.showModal({
							title: '设备信息',
							content: (this.deviceDetail || '未知设备') + '\n应用版本：' + (this.appVersion || '-'),
							showCancel: false
						})
					},
					fail: () => {
						uni.showModal({
							title: '设备信息',
							content: '暂无法获取设备信息',
							showCancel: false
						})
					}
				})
			},
			openUrl(url) {
				// #ifdef H5
				window.open(url)
				// #endif
				// #ifdef APP-PLUS
				plus.runtime.openURL(url)
				// #endif
				// #ifdef MP
				uni.setClipboardData({
					data: url,
					success: () => {
						uni.showToast({
							title: '链接已复制',
							icon: 'none'
						})
					}
				})
				// #endif
			},
			openProject() {
				uni.showActionSheet({
					itemList: ['打开 Gitee', '打开 GitHub', '复制地址'],
					success: (res) => {
						if (res.tapIndex === 0) {
							this.openUrl(GITEE_URL)
						} else if (res.tapIndex === 1) {
							this.openUrl(GITHUB_URL)
						} else if (res.tapIndex === 2) {
							uni.setClipboardData({
								data: GITEE_URL
							})
						}
					}
				})
			},
			showIntro() {
				uni.showModal({
					title: '项目简介',
					content: '来因是开源内容社区，支持笔记发布、关注互动、消息通知与个人主页。',
					showCancel: false
				})
			},
			clearLocalAuth() {
				uni.removeStorageSync("userInfo")
				uni.removeStorageSync("JwtToken")
				uni.removeStorageSync("expiration")
				tokenUtil.clear()
				tokenUtil.clearUserId()
			},
			goLogin() {
				uni.reLaunch({
					url: "/pages/login/login"
				})
			},
			loginOut() {
				const uid = (this.userInfo && this.userInfo.id) || tokenUtil.getUserId()
				const finish = () => {
					this.clearLocalAuth()
					this.goLogin()
				}
				logoutApi({
					userId: uid || ''
				}).then(() => {
					finish()
				}).catch(() => {
					finish()
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./setting.css);
</style>
