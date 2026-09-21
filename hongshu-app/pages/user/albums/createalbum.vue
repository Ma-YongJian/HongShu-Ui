<template>
	<view class="container">
		<hs-nav-bar :title="isupdate ? '修改专辑' : '创建专辑'"></hs-nav-bar>

		<view class="add-album">
			<view class="title1 w">请输入标题</view>
			<view class="add-album-body">
				<input class="add-input" placeholder="请输入专辑名称 " v-model="albumInfo.name" />
			</view>
		</view>

		<view class="upload-img" @click="chooseImg">
			<view class="title2 w">请选择一张图片</view>
			<view class="upload">
				<view class="img-icon" v-if="value == ''">
					<tui-icon name="pic"></tui-icon>
				</view>
				<view v-else>
					<image :src="mediaUrl(value)" mode="aspectFill"></image>
				</view>
			</view>
		</view>

		<view class="delAlbum" v-if="isupdate">
			<tui-button width="180rpx" height="60rpx" type="danger" shape="circle" @click="delAlbum"
				:size='28'>删除专辑</tui-button>
		</view>

		<view class="fotter">
			<view class="add">

				<tui-button type="primary" shape="circle" @click="publish" limit='1'
					:disabled="disabled">点击发布</tui-button>

			</view>
		</view>


		<tui-toast ref="toast"></tui-toast>
		<!-- 弹框 -->
		<tui-modal :show="modal" @click="handleClick" @cancel="hide" content="确定删除所有专辑中的数据吗" color="#333" :size="32"
			shape="circle" :button="modalBtns"></tui-modal>
	</view>
</template>

<script>
	import {
		saveAlbum,
		getAlbum,
		updateAlbum,
		deleteAlbum
	} from '@/api/album.js'
	import {
		uploadImage,
		mediaUrl,
		isLocalMedia
	} from '@/utils/upload.js'
	export default {
		data() {
			return {
				albumInfo: {},
				value: '',
				imageData: [],
				uid: '',
				albumId: '',
				isupdate: false,
				modal: false,
				modalBtns: [{
					text: '取消',
					type: 'primary',
					plain: true
				}, {
					text: '确定',
					type: 'primary',
					plain: false
				}],
				disabled: false

			}
		},
		onLoad(option) {

			this.uid = uni.getStorageSync("userInfo").id

			if (option.albumId != null) {
				this.isupdate = true;
				this.getAlbum(option.albumId)
			}

		},

		methods: {
			mediaUrl,
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			getAlbum(albumId) {

				let params = {
					id: albumId
				}
				getAlbum(params).then(res => {
					this.albumInfo = res.data
					this.value = res.data.cover
				})

			},
			chooseImg() {
				let that = this
				uni.chooseImage({
					count: 1, // 最多可以选择的图片张数，默认9
					sizeType: ['original'], //original 原图，compressed 压缩图，默认二者都有
					sourceType: ['album'], //album 从相册选图，camera 使用相机，默认二者都有。如需直接开相机或直接选相册，请只使用一个选项
					success: function(res) {
						that.value = res.tempFilePaths[0]
					}
				})
			},

			uploadImg() {
				if (!this.value) return Promise.reject(new Error('请选择图片'))
				if (!isLocalMedia(this.value)) return Promise.resolve(this.value)
				return uploadImage(this.value)
			},



			publish() {
				let that = this

				if (that.albumInfo.name == '' || that.albumInfo.name == null) {
					uni.showToast({
						title: "请输入专辑标题",
						icon: 'none'
					})
					return
				} else if (that.value == '') {
					uni.showToast({
						title: "请上传一张图片",
						icon: 'none'
					})
					return
				}

				that.disabled = true

				let promise = that.uploadImg()

				promise.then(function(res) {

					that.albumInfo.cover = res
					that.albumInfo.uid = that.uid

					if (that.isupdate) {
						//修改
						updateAlbum(that.albumInfo).then(res => {
							let params = {
								title: "修改成功",
								imgUrl: "/static/images/toast/check-circle.png",
								icon: true
							}
							that.$refs.toast.show(params);
							that.albumInfo.name = ''
							that.value = ''
							setTimeout(() => {
								uni.reLaunch({
									url: "/pages/user/user?currentTab=" + 1
								})
							}, 1000)
						})
					} else {
						//发布
						saveAlbum(that.albumInfo).then(res => {
							let params = {
								title: "发布成功",
								imgUrl: "/static/images/toast/check-circle.png",
								icon: true
							}
							that.$refs.toast.show(params);
							that.albumInfo.name = ''
							that.value = ''
							setTimeout(() => {
								uni.reLaunch({
									url: "/pages/user/user?currentTab=" + 1
								})
							}, 1000)
						})
					}

				})
			},

			hide() {
				this.modal = false
			},

			delAlbum() {
				this.modal = true
			},
			handleClick(e) {
				let index = e.index;

				if (index == 1) {
					let params = {
						id: this.albumInfo.id,
						uid: this.uid
					}
					deleteAlbum(params).then(res => {

						let params = {
							title: "删除成功",
							imgUrl: "/static/images/toast/check-circle.png",
							icon: true
						}
						this.$refs.toast.show(params);

						setTimeout(() => {
							uni.reLaunch({
								url: "/pages/user/user?currentTab=" + 1
							})
						}, 1000)
					})
				}
				this.hide();
			},

		}
	}
</script>

<style scoped>
	@import url(./css/createalbum.css);
</style>