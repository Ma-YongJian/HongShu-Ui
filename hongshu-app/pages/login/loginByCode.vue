<template>
	<view class="container">
		<hs-nav-bar title="验证码登录"></hs-nav-bar>
		<view class="main">
			<view class="center">
				<input placeholder="请输入手机号" class="info-input" v-model="value" />
				<view class="code">
					<input placeholder="请输入验证码" class="info-input" v-model="code" />
					<tui-button type="white" width="200rpx" :link="true" height="60rpx" @click="getCode()"
						v-if="T">验证码</tui-button>
					<tui-tag type="white" v-else>{{ count }}</tui-tag>
				</view>
			</view>

			<view class="regist">
				<tui-button @click="loginByCode" type="primary" shape="circle">登录</tui-button>
			</view>
		</view>

		<view></view>

	</view>
</template>

<script>
	import {
		sendDm,
		sendMsm
	} from "@/api/regist.js"
	import {
		tokenUtil
	} from "@/utils/token.js"
	import {
		loginByCode
	} from "@/api/login.js"
	import {
		isMobile,
		isEmail
	} from '@/utils/validate.js'
	import { subscribeIm } from '@/utils/imSocket.js'

	export default {
		data() {
			return {
				T: true,
				count: 0,
				userInfo: {},
				value: '',
				code: '',
			}
		},
		methods: {
			getCode() {

				let isM = isMobile(this.value)
				let isE = isEmail(this.value)

				if (isM) {
					let data = {}
					data.phone = this.value
					sendMsm(data).then(res => {
						uni.showToast({
							title: "发送成功"
						})
					})
				} else if (isE) {
					let data = {}
					data.email = this.value
					sendDm(data).then(res => {
						uni.showToast({
							title: "发送成功"
						})
					})
				} else {
					uni.showToast({
						title: "请输入正确手机号或邮箱",
						icon: 'none'
					})
					return
				}

				this.T = false
				this.count = 60
				var times = setInterval(() => {
					this.count--; //递减
					if (this.count <= 1) {
						this.T = true
						clearInterval(times);
					}
				}, 1000)

			},

			loginByCode() {
				let isM = isMobile(this.value)
				let isE = isEmail(this.value)
				this.userInfo.code = this.code
				if (isM) {
					this.userInfo.phone = this.value
				} else if (isE) {
					this.userInfo.email = this.value
				}

				loginByCode(this.userInfo).then(res => {
					const data = (res && res.data) || {}
					const user = data.userInfo
					const token = data.accessToken || data.JwtToken
					if (res.code === 200 && user && token) {
						uni.removeStorageSync('JwtToken')
						tokenUtil.set(token)
						tokenUtil.setUserId(user.id)
						uni.setStorageSync("userInfo", user)
						subscribeIm()
						uni.showToast({
							title: "登录成功",
							icon: 'success'
						})
						setTimeout(() => {
							uni.reLaunch({
								url: "/pages/index/index"
							});
						}, 500)
						return
					}
					uni.showToast({
						title: (res && (res.message || data.message)) || "登录失败",
						icon: 'none'
					})
				})

			},

		}
	}
</script>

<style scoped>
	@import url(./css/loginByCode.css);
</style>