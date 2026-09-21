<template>
	<view class="container">
		<hs-nav-bar :title="pageTitle"></hs-nav-bar>

		<view class="upload-img" @click="uploadImg">
			<view class="title2 w">请上传一张新的图片</view>
			<view class="upload">
				<view class="img-icon" v-if="value == ''">
					<tui-icon name="pic"></tui-icon>
				</view>
				<view v-else>
					<image :src="preview" mode="aspectFill"></image>
				</view>
			</view>
		</view>

		<view class="fotter">
			<view class="add">
				<tui-button type="primary" shape="circle" @click="publish" :disabled="disabled">保存</tui-button>
			</view>
		</view>
	</view>
</template>

<script>
	import { getUserInfo, updateUser } from "@/api/user.js"
	import { mediaUrl, uploadImage } from '@/utils/upload.js'

	export default {
		data() {
			return {
				value: '',
				uid: '',
				type: 1,
				userInfo: {},
				disabled: true,
				uploading: false
			}
		},
		computed: {
			pageTitle() {
				return this.type == 1 ? '上传头像' : '上传封面'
			},
			preview() {
				return mediaUrl(this.value)
			}
		},
		onLoad(options) {
			const cached = uni.getStorageSync("userInfo") || {}
			this.uid = cached.id
			this.type = Number(options.type || 1)
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
					this.value = this.type == 1 ? (res.data.avatar || '') : (res.data.userCover || '')
				})
			},
			uploadImg() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed', 'original'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.value = res.tempFilePaths[0]
						this.disabled = false
					}
				})
			},
			publish() {
				if (this.disabled || this.uploading) return
				this.uploading = true
				this.disabled = true
				uni.showLoading({
					title: '保存中'
				})
				uploadImage(this.value).then((path) => {
					const payload = this.type == 1 ? { avatar: path } : { userCover: path }
					return updateUser(payload).then((res) => {
						if (res.code !== 200) {
							throw new Error(res.message || '保存失败')
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
					})
				}).catch((err) => {
					uni.showToast({
						title: (err && err.message) || '上传失败',
						icon: 'none'
					})
					this.disabled = false
				}).then(() => {
					this.uploading = false
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./updateImg.css);
</style>
