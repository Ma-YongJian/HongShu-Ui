<template>
	<view class="container">
		<hs-nav-bar title="用户专辑"></hs-nav-bar>
		<view class="main">
			<view class="albums">
				<ul>
					<li :class="T == index ? 'item-activate' : ''" v-for="(item, index) in dataList" :key='index'>
						<view @click="selectOne(item.id, index)" class="album-body">
							<image :src="item.albumCover" mode="aspectFill" />
							<view class="content">{{ item.title }}</view>
						</view>
					</li>
				</ul>
			</view>
			<view class="add-album">
				<view class="title">*快速创建专辑</view>
				<view class="add-album-body">
					<input class="add-input" placeholder="请输入专辑名称 " v-model="album.title" />
					<tui-button type="primary" height="66rpx" width="120rpx" @click="saveAlbum"
						:size="24">创建专辑</tui-button>
				</view>
			</view>
		</view>
		<view class="fotter">
			<view class="add">
				<tui-button type="primary" shape="circle" @click="publish" v-if="mid == ''"
					:disabled="isDisabled">点击发布</tui-button>
				<tui-button type="primary" shape="circle" @click="saveImgToAlbum" v-else>添加至专辑</tui-button>
			</view>
		</view>
		<tui-toast ref="toast"></tui-toast>
	</view>
</template>

<script>
	import {
		saveAlbum,
		getAllAlbum,
		addAlbumImgRelation
	} from "@/api/album.js"
	import {
		publish,
		updateImgDetail,
		updateStatus
	} from '@/api/imgDetail.js'
	import {
		appConfig
	} from '@/config/config'
	import {
		isURL
	} from '@/utils/validate.js'
	export default {
		data() {
			return {
				T: -1,
				imgInfo: {
					albumId: '',
				},
				page: 1,
				limit: 10,
				album: {},
				dataList: [],
				userInfo: {},
				imageList: [],
				imgurl: [],
				mid: '',
				isDisabled: false,
				type: '',
			}
		},
		onLoad(option) {
			if (typeof option.mid != 'undefined' && option.mid != null) {
				this.mid = option.mid
			}

			if (option.type != null) {
				this.type = option.type
			}

		},
		created() {
			let that = this
			that.userInfo = uni.getStorageSync("userInfo") || {}
			if (!that.userInfo.id) {
				return
			}
			that.getAllAlbum()
			try {
				const raw = uni.getStorageSync('imgInfo')
				that.imgInfo = raw ? JSON.parse(raw) : { albumId: '' }
			} catch (e) {
				that.imgInfo = { albumId: '' }
			}
		},
		methods: {

			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			getAllAlbum() {
				let data = {
					userId: this.userInfo.id
				}
				getAllAlbum(this.page, this.limit, data).then(res => {
					this.dataList = res.data.records
				})
			},

			selectOne(id, index) {
				this.T = index
				this.imgInfo.albumId = id
			},

			publish() {
				this.$refs.toast.show({
					title: "请从发布页直接提交笔记"
				})
			},

			saveAlbum() {
				this.album.albumCover =
					"https://image.mayongjian.cn/2024/06/28/1068300f40bd4d4ca114760ac923ceb1.jpg"
				this.album.uid = this.userInfo.id
				saveAlbum(this.album).then(res => {
					let params = {
						title: "添加成功",
						imgUrl: "/static/images/toast/check-circle.png",
						icon: true
					}
					this.$refs.toast.show(params);
					this.album.title = ''
					this.getAllAlbum()
				})
			},

			saveImgToAlbum() {
				if (!this.imgInfo.albumId) {
					this.$refs.toast.show({
						title: "请选择专辑"
					})
					return
				}
				addAlbumImgRelation({
					aid: this.imgInfo.albumId,
					nid: this.mid
				}).then(() => {
					let params = {
						title: "收藏成功",
						imgUrl: "/static/images/toast/check-circle.png",
						icon: true
					}
					this.$refs.toast.show(params);

					uni.navigateTo({
						url: "/pages/main/main?mid=" + this.mid
					})
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./addalbum.css);
</style>