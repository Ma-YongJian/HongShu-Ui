<template>
	<view class="login-page">
		<hs-nav-bar :showBack="canBack" :border="false" background="transparent"></hs-nav-bar>
		<view class="login-card">
			<view class="logo-section">
				<image class="logo-img" src="/static/logo.png" mode="heightFix"></image>
				<text class="welcome">欢迎回来</text>
				<text class="subtitle">登录后继续浏览来因社区</text>
			</view>

			<view class="form-section">
				<view class="input-group">
					<tui-icon name="mobile" :size="20" color="#9ca3af"></tui-icon>
					<input
						class="input-field"
						placeholder="请输入手机号"
						v-model="userInfo.phone"
						type="number"
						maxlength="11"
					/>
				</view>

				<view class="input-group">
					<tui-icon name="pwd" :size="20" color="#9ca3af"></tui-icon>
					<input
						class="input-field"
						placeholder="请输入密码"
						v-model="userInfo.password"
						:password="!showPwd"
					/>
					<view class="eye" @click="togglePwd">
						<tui-icon :name="showPwd ? 'eye' : 'unseen'" :size="20" color="#9ca3af"></tui-icon>
					</view>
				</view>
			</view>

			<button
				class="login-button"
				:class="{ loading: loading }"
				@click="login"
				:disabled="loading"
			>
				{{ loading ? '登录中...' : '登 录' }}
			</button>
			<view class="login-hint">— 新用户直接登录（自动注册） —</view>
		</view>
	</view>
</template>

<script>
	import {
		login
	} from "@/api/login.js"
	import {
		tokenUtil
	} from "@/utils/token.js"
	import {
		isMobile
	} from '@/utils/validate.js'
	
	export default {
		data() {
			return {
				userInfo: {
					phone: '',
					password: ''
				},
				loading: false,
				showPwd: false
			}
		},

		computed: {
			canBack() {
				return getCurrentPages().length > 1
			}
		},
		created() {
			uni.hideTabBar()
		},
		onUnload() {
			uni.showTabBar()
		},

		methods: {
			togglePwd() {
				this.showPwd = !this.showPwd
			},
			login() {
				// 验证手机号
				if (!this.userInfo.phone) {
					uni.showToast({
						title: "请输入手机号",
						icon: 'none'
					})
					return
				}
				
				let isPhone = isMobile(this.userInfo.phone)
				if (!isPhone) {
					uni.showToast({
						title: "请输入正确的手机号",
						icon: 'none'
					})
					return
				}
				
				// 验证密码
				if (!this.userInfo.password) {
					uni.showToast({
						title: "请输入密码",
						icon: 'none'
					})
					return
				}
				
				if (this.loading) {
					return
				}
				
				this.loading = true
				
				login(this.userInfo).then(res => {
					this.loading = false
					// 根据后端返回格式：Result(code, message, data)
					// data 中包含 accessToken, refreshToken, userInfo
					if (res.code === 200 && res.data) {
						// 登录成功
						let user = res.data.userInfo
						if (user && res.data.accessToken) {
							// 清除旧的token（如果存在）
							uni.removeStorageSync('JwtToken')
							// 保存新token（保存的是纯token，不带Bearer前缀）
							tokenUtil.set(res.data.accessToken)
							tokenUtil.setUserId(user.id)
							uni.setStorageSync("userInfo", user)
							
							// 调试：确认token已保存（开发时可查看，生产环境请删除）
							// console.log('登录成功，token已保存:', {
							// 	tokenKey: appConfig.tokenKey,
							// 	hasToken: !!tokenUtil.get(),
							// 	userId: user.id
							// })
							
							uni.showToast({
								title: "登录成功",
								icon: 'success'
							})
							
							setTimeout(() => {
								uni.reLaunch({
									url: "/pages/index/index"
								});
							}, 500)
						} else {
							uni.showToast({
								title: res.message || "登录失败，请稍后重试",
								icon: 'none'
							})
						}
					} else {
						// 登录失败
						uni.showToast({
							title: res.message || "登录失败，请检查手机号和密码",
							icon: 'none'
						})
					}
				}).catch(err => {
					this.loading = false
					console.error('登录错误:', err)
					let errorMsg = "登录失败，请稍后重试"
					if (err && err.message) {
						errorMsg = err.message
					} else if (err && err.data && err.data.message) {
						errorMsg = err.data.message
					}
					uni.showToast({
						title: errorMsg,
						icon: 'none'
					})
				})
			}
		}
	}
</script>

<style scoped>
	.login-page {
		min-height: 100vh;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 46%, #ffffff 100%);
	}

	.login-page >>> .hs-nav-root {
		width: 100%;
		flex-shrink: 0;
	}

	.login-card {
		flex: 1;
		width: 100%;
		box-sizing: border-box;
		padding: 24rpx 48rpx 80rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.logo-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 56rpx;
	}

	.logo-img {
		height: 96rpx;
		margin-bottom: 28rpx;
	}

	.welcome {
		font-size: 40rpx;
		font-weight: 600;
		color: #111827;
		line-height: 1.4;
	}

	.subtitle {
		margin-top: 10rpx;
		font-size: 26rpx;
		color: #6b7280;
	}

	.form-section {
		margin-bottom: 48rpx;
	}

	.input-group {
		display: flex;
		align-items: center;
		height: 100rpx;
		padding: 0 28rpx;
		margin-bottom: 24rpx;
		background: #f3f4f6;
		border-radius: 20rpx;
		box-sizing: border-box;
	}

	.input-field {
		flex: 1;
		height: 100rpx;
		margin-left: 16rpx;
		font-size: 30rpx;
		color: #111827;
	}

	.input-field::placeholder {
		color: #9ca3af;
	}

	.eye {
		padding-left: 12rpx;
	}

	.login-button {
		width: 100%;
		height: 96rpx;
		line-height: 96rpx;
		background-color: #3d8af5;
		color: #ffffff;
		font-size: 34rpx;
		font-weight: 600;
		letter-spacing: 8rpx;
		border-radius: 20rpx;
		border: none;
		box-shadow: 0 12rpx 28rpx rgba(61, 138, 245, 0.28);
	}

	.login-button::after {
		border: none;
	}

	.login-button[disabled],
	.login-button.loading {
		background-color: #93c5fd;
		box-shadow: none;
	}

	.login-hint {
		margin-top: 40rpx;
		text-align: center;
		font-size: 24rpx;
		color: #bbbbbb;
		letter-spacing: 2rpx;
	}
</style>
