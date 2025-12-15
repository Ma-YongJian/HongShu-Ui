<template>
	<view class="container">
		<!-- <ul>
			<uni-list :data='dataList' :total='total'>
				<li v-for="(item, index) in dataList" :key="index">
					<view class="item">
						<view class="top">
							<view class="avatar-user">
								<view class="avatar">
									<image :src="userInfo.avatar" mode="aspectFill" :lazy-load='true' />
								</view>
								<view class="user">
									<view class="name">{{ userInfo.username }}</view>
									<view class="time">{{ item.time }}</view>
								</view>
							</view>
							<view class="upload-loading" v-if="item.status==0" @click="cancelUpload(item.mid)">
								上传中...</view>
						</view>
						<view class="content">
							{{ item.title }}
						</view>
						<view class="main">

							<view class="img-list" @click="toMain(item.id,item.status)">
								<view v-for="(img, index) in item.imgsUrl" :key="index" class="img-container">
									<image :src="img" mode="aspectFill" :lazy-load="true" class="fadeImg" />
									<view v-if="item.auditStatus === '0'" class="overlay">审核中</view>
									<view v-if="item.auditStatus === '2'" class="overlay not-passed">未通过⚠️</view>
								</view>
							</view>
							
							<view class="fotter">
								<view class="icon">
									<tui-icon name="agree-fill" size="16" v-if="item.isAgree"
										@click="cancelAgreeImg(item, index)"></tui-icon>
									<tui-icon name="agree" size="16" v-else @click="agreeImg(item, index)"></tui-icon>
									<view class="count">{{ item.likeCount }}</view>
								</view>
								<view class="icon" @click="getComment(item.mid)">
									<tui-icon name="message" size="16"></tui-icon>
									<view class="count">{{ item.commentCount }}</view>
								</view>
								<view class="icon">
									<tui-icon name="more" size="16"></tui-icon>
								</view>
							</view>

							<view class="collection-album" @click="toAlbum(item.albumId)">
									<view class="left">
										<tui-icon name="upload" size="18" color="#fd6d49"></tui-icon>
										<view class="content1">更新专辑:</view>
										<view class="content2">{{ item.albumName }}</view>
									</view>
									<view class="right">
										<tui-icon name="arrowright" size="24"></tui-icon>
									</view>
								</view>

						</view>
						<view class="fotter"></view>
					</view>
				</li>
			</uni-list>
		</ul> -->

		<pp-waterfall-flow :value="dataList" @clickImage="getImgInfo"> </pp-waterfall-flow>
		<view class="loadStyle" v-if="!isEnd && loading">正在加载中</view>
		<view class="loadStyle" v-if="isEnd">我也是有底线的~</view>
	</view>
</template>

<script>
	import {
		getTrendByUser
	} from "@/api/user.js"
	import {
		getUserInfo
	} from "@/api/user.js"
	import {
		addBrowseRecord
	} from "@/api/browseRecord.js"
	import {
		timeAgo
	} from "@/utils/webUtils.js"
	import {
		publish,
		updateImgDetail,
		updateStatus,
		deleteImgs
	} from '@/api/imgDetail.js'
	import {
		appConfig
	} from '@/config/config'
	export default {
		props: {
			uid: String,
			seed: Number,
		},
		data() {
			return {
				page: 1,
				limit: 5,
				userInfo: {},
				dataList: [],
				isEnd: false, //是否到底底部了
				loading: false, //是否正在加载
				total: 0,
				type: 0,
			}
		},

		watch: {
			seed(newVal, oldVal) {
				this.loadData()
			}
		},

		created() {
			this.userInfo = uni.getStorageSync("userInfo")
			this.getUserInfo(this.uid)
		},

		methods: {
			getImgInfo(e) {
				//添加一条浏览记录
				let data = {}
				data.uid = this.userInfo.id
				data.mid = e.id
			
				addBrowseRecord(data).then(res => {
					uni.navigateTo({
						url: "/pages/main/main?mid=" + e.id
					})
				})
			},
			
			getTrendByUser() {
				let params = {
					userId: this.userInfo.id,
					type: 3,
					status: -1
				}
				getTrendByUser(this.page, this.limit, params).then(res => {
					res.data.records.forEach(e => {
						e.time = timeAgo(e.time)
						e.imgsUrl = JSON.parse(e.urls)
						e.type = this.type
						this.dataList.push(e)
					})
					this.total = res.data.total
				})
			},
			
			getUserInfo(uid) {
				let params = {
					userId: uid
				}
				getUserInfo(params).then(res => {
					this.userInfo = res.data
					console.log("----", res.data)
					if (res.data.id == uni.getStorageSync("userInfo").id) {
						this.type = 3
					}
					this.getTrendByUser()

				})
			},

			loadData() {
				this.loading = true
				setTimeout(() => {
					if (this.dataList.length >= this.total) {
						this.isEnd = true
						return
					}
					this.page = this.page + 1;
					let params = {
						userId: this.userInfo.id,
						type: 3,
						status: -1
					}
					getTrendByUser(this.page, this.limit, params).then(res => {
						res.data.records.forEach(e => {
							e.time = timeAgo(e.time)
							e.imgsUrl = JSON.parse(e.urls)
							this.dataList.push(e)
						})
					})
				}, 200)
			},

			cancelUpload(mid) {
				this.$emit('cancelUp', mid)
			},

			toMain(mid, status) {

				if (status == 0) {
					uni.showToast({
						title: "图片正在上传中...",
						icon: "none"
					});
					return
				}

				let data = {}
				data.uid = this.userInfo.id
				data.mid = mid

				addBrowseRecord(data).then(res => {
					uni.navigateTo({
						url: "/pages/main/main?mid=" + mid
					})
				})
			},

			toAlbum(aid) {
				uni.navigateTo({
					url: "/pages/user/albums/albumInfo?albumId=" + aid
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./collects.css);
</style>