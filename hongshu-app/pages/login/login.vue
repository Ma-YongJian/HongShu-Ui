<template>
	<view class="login-container">
		<!-- 标题 -->
		<view class="title">登录</view>
		
		<!-- Logo区域 -->
		<view class="logo-section">
			<text class="brand-text">小红薯</text>
		</view>
		
		<!-- 输入框区域 -->
		<view class="form-section">
			<view class="input-group">
				<input 
					class="input-field" 
					placeholder="请输入手机号" 
					v-model="userInfo.phone" 
					type="number"
					maxlength="11"
				/>
			</view>
			
			<view class="input-group">
				<input 
					class="input-field" 
					placeholder="密码6-16位,必须包含数字和字母" 
					v-model="userInfo.password" 
					type="password"
				/>
			</view>
		</view>
		
		<!-- 登录按钮 -->
		<view class="button-section">
			<button 
				class="login-button" 
				@click="login"
				:disabled="loading"
			>
				{{ loading ? '登录中...' : '登录' }}
			</button>
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
				loading: false
			}
		},

		created() {
			uni.hideTabBar()
		},

		methods: {
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
	.login-container {
		min-height: 100vh;
		background-color: #ffffff;
		padding: 0 60rpx;
	}

	/* 标题 */
	.title {
		text-align: center;
		font-size: 48rpx;
		font-weight: bold;
		color: #000000;
		padding-top: 80rpx;
		margin-bottom: 120rpx;
	}

	/* Logo区域 */
	.logo-section {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 120rpx;
	}

	.logo {
		font-size: 80rpx;
		margin-right: 20rpx;
	}

	.brand-text {
		font-size: 48rpx;
		color: #FF0000;
		font-weight: normal;
	}

	/* 表单区域 */
	.form-section {
		margin-bottom: 80rpx;
	}

	.input-group {
		margin-bottom: 40rpx;
	}

	.input-field {
		width: 100%;
		height: 96rpx;
		line-height: 96rpx;
		padding: 0 32rpx;
		background-color: #ffffff;
		border: 2rpx solid #E5E5E5;
		border-radius: 16rpx;
		font-size: 32rpx;
		color: #333333;
		box-sizing: border-box;
	}

	.input-field::placeholder {
		color: #999999;
	}

	/* 按钮区域 */
	.button-section {
		margin-top: 100rpx;
	}

	.login-button {
		width: 100%;
		height: 96rpx;
		line-height: 96rpx;
		background-color: #FF0000;
		color: #ffffff;
		font-size: 36rpx;
		font-weight: normal;
		border-radius: 16rpx;
		border: none;
	}

	.login-button::after {
		border: none;
	}

	.login-button[disabled] {
		background-color: #CCCCCC;
		opacity: 0.6;
	}
</style>
