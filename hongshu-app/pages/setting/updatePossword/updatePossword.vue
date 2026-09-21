<template>
	<view class="pwd-page">
		<hs-nav-bar title="修改密码"></hs-nav-bar>

		<view class="hint">请设置 8-20 位字母和数字组合的新密码</view>

		<view class="form-card">
			<view class="field">
				<input class="field-input" :password="!showPwd" v-model="password" maxlength="20" placeholder="输入新密码" />
				<view class="eye" @click="togglePwd">
					<tui-icon :name="showPwd ? 'eye' : 'unseen'" size="20" color="#9ca3af"></tui-icon>
				</view>
			</view>
			<view class="field field-last">
				<input class="field-input" :password="!showCheck" v-model="checkPassword" maxlength="20"
					placeholder="再次输入新密码" />
				<view class="eye" @click="toggleCheck">
					<tui-icon :name="showCheck ? 'eye' : 'unseen'" size="20" color="#9ca3af"></tui-icon>
				</view>
			</view>
		</view>

		<view class="save-wrap">
			<tui-button type="primary" shape="circle" :disabled="saving" @click="submit">保存</tui-button>
		</view>
	</view>
</template>

<script>
	import { updatePassword } from "@/api/login.js"
	import { validatorPassword } from '@/utils/validate.js'

	export default {
		data() {
			return {
				password: '',
				checkPassword: '',
				showPwd: false,
				showCheck: false,
				saving: false
			}
		},
		methods: {
			togglePwd() {
				this.showPwd = !this.showPwd
			},
			toggleCheck() {
				this.showCheck = !this.showCheck
			},
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			submit() {
				if (!validatorPassword(this.password)) {
					uni.showToast({
						title: '请输入8-20位由字母和数字组成的密码',
						icon: 'none'
					})
					return
				}
				if (this.password !== this.checkPassword) {
					uni.showToast({
						title: '两次输入的密码不一致',
						icon: 'none'
					})
					return
				}
				if (this.saving) return
				this.saving = true
				updatePassword({
					password: this.password,
					checkPassword: this.checkPassword
				}).then(res => {
					if (res.code !== 200 || res.data === false) {
						uni.showToast({
							title: res.message || '修改失败',
							icon: 'none'
						})
						this.saving = false
						return
					}
					uni.showToast({
						title: '修改成功',
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						})
					}, 600)
				}).catch(() => {
					uni.showToast({
						title: '修改失败',
						icon: 'none'
					})
				}).then(() => {
					this.saving = false
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./updatePassword.css);
</style>
