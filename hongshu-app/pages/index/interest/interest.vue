<template>
	<view class="container">
		<view class="nav">
			<view>动态</view>
		</view>

		<scroll-view scroll-y class="page" @scrolltolower="loadData" refresher-enabled="true"
			:refresher-triggered="triggered" @refresherrefresh="onRefresh" :scroll-top="scrollTop" @scroll="scroll">
			<ul>
				<li v-for="(item, index) in dataList" :key="index">
					<view class="item">
						<view class="top">
							<view class="avatar-user">
								<view class="avatar" @click="getUserInfo(item.uid)">
									<image :src="item.avatar" mode="aspectFill" :lazy-load='true' />
								</view>
								<view class="user">
									<view class="name">{{ item.username }}</view>
									<view class="time">{{ item.time }}</view>
								</view>
							</view>
						</view>
						<view class="content">
							{{ item.content }}
						</view>
						<view class="main">
							<view class="img-list" @click="toMain(item.nid)">
								<view v-for="(img, index) in item.imgsUrl.slice(0, 3)" :key="index"
									class="image-container">
									<image :src="img" mode="aspectFill" :lazy-load='true' class="fadeImg" />
									<view v-if="index === 2 && item.imgsUrl.length > 3" class="overlay">
										<text class="more-text">+{{ item.imgsUrl.length - 3 }}</text>
									</view>
								</view>
							</view>
						</view>
						<!-- 						<view class="main" @click="toMain(item.nid)">
							<swiper class="swiper-container" indicator-dots="true" autoplay="false">
								<swiper-item v-for="(img, index) in item.imgsUrl" :key="index" class="image-container">
									<image :src="img" mode="aspectFill" :lazy-load='true' class="fadeImg" />
								</swiper-item>
							</swiper>
						</view> -->

						<view class="fotter">
							<view class="icon">
								<tui-icon name="like-fill" size="16" v-if="item.isLike"
									@click="cancelAgreeImg(item, index)" style="color: red;">></tui-icon>
								<tui-icon name="like" size="16" v-else @click="agreeImg(item, index)"></tui-icon>
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
					</view>
				</li>
			</ul>
			<view class="loadStyle" v-if="!isEnd && loading">
				<tui-icon name="loading" :size="18"></tui-icon>
			</view>
			<view class="loadStyle" v-if="isEnd">我也是有底线的~</view>
		</scroll-view>
		<trend-comment :popupShow="popupShow" @popup="popup" :mid="mid" :seed="seed"></trend-comment>
	</view>
</template>

<script>
	import {
		getAllFollowTrends
	} from "@/api/interest.js"
	import {
		addBrowseRecord
	} from "@/api/browseRecord.js"
	import TrendComment from "@/components/trendComment.vue"
	import {
		agree,
		cancelAgree
	} from "@/api/agreeCollect.js"
	import {
		timeAgo
	} from "@/utils/webUtils.js"
	export default {
		components: {
			TrendComment,
		},
		data() {
			return {
				userInfo: {},
				triggered: false,
				page: 1,
				limit: 5,
				dataList: [],
				popupShow: false,
				isEnd: false, //是否到底底部了
				loading: false, //是否正在加载
				total: 0,
				mid: '',
				seed: 0,
				scrollTop: 0,
				old: {
					scrollTop: 0
				},
			}
		},
		created() {
			this.userInfo = uni.getStorageSync("userInfo")
			if (typeof this.userInfo == 'undefined' || this.userInfo == null || this.userInfo == '') {
				uni.showToast({
					title: "用户未登录",
					icon: 'none',
				})
				return;
			} else {
				this.getAllFollowTrends()
			}
		},

		methods: {
			getComment(mid) {
				this.noteId = mid
				this.seed = Math.random()
				this.popupShow = true;
				uni.hideTabBar()
			},
			popup(popupShow) {
				this.popupShow = popupShow
			},
			getAllFollowTrends() {
				let params = {
					uid: this.userInfo.id
				}
				getAllFollowTrends(this.page, this.limit, params).then(res => {
					res.data.records.forEach(e => {
						e.time = timeAgo(e.time)
						e.imgsUrl = e.imgUrls
						this.dataList.push(e)
					})
					this.total = res.data.length
				})
			},

			onRefresh() {
				this.triggered = true;
				this.isEnd = false
				this.dataList = [];
				setTimeout(() => {
					this.triggered = false;
					this.page = 1
					this.getAllFollowTrends()
				}, 500)
			},

			loadData() {
				this.loading = true;
				this.page = this.page + 1;
				let params = {
					uid: this.userInfo.id
				}
				getAllFollowTrends(this.page, this.limit, params).then(res => {
					const newRecords = res.data.records;
					if (newRecords.length < this.limit) {
						this.isEnd = true;
					}
					newRecords.forEach(e => {
						e.time = timeAgo(e.time);
						e.imgsUrl = e.imgUrls;
						this.dataList.push(e);
					});
					this.total += newRecords.length;
					this.loading = false;
				}).catch(() => {
					this.loading = false;
				});
			},

			getUserInfo(uid) {
				uni.navigateTo({
					url: "/pages/otherUser/otherUser?uid=" + uid
				})
			},

			toMain(nid) {
				let data = {}
				data.uid = this.userInfo.id
				data.noteId = nid
				addBrowseRecord(data).then(res => {
					uni.navigateTo({
						url: "/pages/main/main?mid=" + nid
					})
				})
			},

			toAlbum(aid) {
				uni.navigateTo({
					url: "/pages/user/albums/albumInfo?albumId=" + aid
				})
			},

			agreeImg(item, index) {
				let data = {}
				data.uid = uni.getStorageSync("userInfo").id
				data.type = 1
				data.likeOrCollectionId = item.nid
				data.publishUid = item.uid
				agree(data).then(res => {
					this.dataList[index].likeCount = this.dataList[index].likeCount * 1 + 1
					this.dataList[index].isLike = true
				})
			},

			cancelAgreeImg(item, index) {
				let data = {}
				data.uid = uni.getStorageSync("userInfo").id
				data.likeOrCollectionId = item.nid
				data.publishUid = item.uid
				data.type = 1
				cancelAgree(data).then(res => {
					this.dataList[index].likeCount = this.dataList[index].likeCount * 1 - 1
					this.dataList[index].isLike = false
				})
			},
			scroll(e) {
				this.old.scrollTop = e.detail.scrollTop
			},
		}
	}
</script>

<style scoped>
	@import url(./interest.css);
</style>