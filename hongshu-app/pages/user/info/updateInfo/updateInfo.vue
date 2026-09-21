<template>
	<view class="container">
		<hs-nav-bar :title="pageTitle"></hs-nav-bar>

		<view class="update-info">
			<view class="title2 w">{{ hintText }}</view>
			<view class="update">
				<textarea class="textarea" :placeholder="placeholderText" v-model="value"
					:maxlength="maxLen"></textarea>
			</view>
		</view>

		<view class="fotter">
			<view class="add">
				<tui-button type="primary" shape="circle" @click="publish">保存</tui-button>
			</view>
		</view>
	</view>
</template>

<script>
	import { getUserInfo, updateUser } from "@/api/user.js"

	export default {
		data() {
			return {
				type: 1,
				value: '',
				uid: '',
				userInfo: {},
				saving: false
			}
		},
		computed: {
			pageTitle() {
				if (this.type == 1) return '修改昵称'
				if (this.type == 6) return '修改标签'
				return '修改简介'
			},
			hintText() {
				if (this.type == 1) return '请设置 2-12 个字符'
				if (this.type == 6) return '多个标签用逗号分隔，最多 50 个字符'
				return '介绍一下自己吧'
			},
			placeholderText() {
				if (this.type == 1) return '请输入昵称'
				if (this.type == 6) return '请输入标签'
				return '请输入简介'
			},
			maxLen() {
				if (this.type == 1) return 12
				if (this.type == 6) return 50
				return 100
			}
		},
		onLoad(options) {
			const cached = uni.getStorageSync("userInfo") || {}
			this.type = Number(options.type || 1)
			this.uid = cached.id
			this.loadUser()
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			loadUser() {
				getUserInfo({
					userId: this.uid
				}).then(res => {
					if (res.code !== 200) return
					this.userInfo = res.data || {}
					if (this.type == 1) {
						this.value = res.data.username || ''
					} else if (this.type == 6) {
						this.value = res.data.tags || ''
					} else {
						this.value = res.data.description || ''
					}
				})
			},
			publish() {
				const text = (this.value || '').trim()
				const payload = {}
				if (this.type == 1) {
					if (text.length < 2) {
						uni.showToast({
							title: '昵称至少 2 个字符',
							icon: 'none'
						})
						return
					}
					payload.username = text
				} else if (this.type == 6) {
					payload.tags = text
				} else {
					payload.description = text
				}
				if (this.saving) return
				this.saving = true
				updateUser(payload).then(res => {
					if (res.code !== 200) {
						uni.showToast({
							title: res.message || '保存失败',
							icon: 'none'
						})
						this.saving = false
						return
					}
					uni.setStorageSync("userInfo", Object.assign({}, uni.getStorageSync("userInfo") || {}, res.data || payload))
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
						title: '保存失败',
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
	@import url(./updateInfo.css);
</style>
