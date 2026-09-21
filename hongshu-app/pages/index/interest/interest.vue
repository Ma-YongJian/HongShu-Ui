<template>
	<view class="container" :style="{ height: windowHeight + 'px' }">
		<hs-nav-bar title="动态" :showBack="false" :isFixed="true" @init="onNavInit"></hs-nav-bar>

		<scroll-view scroll-y class="page" :style="{ height: pageHeight + 'px' }" :lower-threshold="80"
			@scrolltolower="loadData" :refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh">
			<view class="feed-item" v-for="(item, index) in dataList" :key="index">
				<view class="top">
					<view class="avatar-user">
						<image class="avatar-img" :src="item.avatar" mode="aspectFill" @click="onTapUser(index)"></image>
						<view class="user">
							<view class="name">{{ item.username }}</view>
							<view class="time">{{ item.time }}</view>
						</view>
					</view>
				</view>
				<view class="content" v-if="item.content">{{ item.content }}</view>
				<view class="main" v-if="item.previewImgs && item.previewImgs.length" @click="onTapNote(index)">
					<view class="img-list">
						<view v-for="(img, imgIndex) in item.previewImgs" :key="imgIndex" class="image-container">
							<image :src="img" mode="aspectFill" class="fadeImg"></image>
							<view v-if="imgIndex === 2 && item.moreImgCount" class="overlay">
								<text class="more-text">+{{ item.moreImgCount }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="fotter">
					<view class="icon">
						<tui-icon name="like-fill" :size="16" v-if="item.isLike" @click="cancelAgreeImg(index)"
							color="#ff2442"></tui-icon>
						<tui-icon name="like" :size="16" v-else @click="agreeImg(index)"></tui-icon>
						<view class="count">{{ item.likeCount || 0 }}</view>
					</view>
					<view class="icon" @click="onTapComment(index)">
						<tui-icon name="message" :size="16"></tui-icon>
						<view class="count">{{ item.commentCount || 0 }}</view>
					</view>
				</view>
			</view>
			<hs-empty v-if="!loading && !dataList.length" :title="hasLogin ? '还没有关注动态' : '登录后查看关注动态'"
				:tip="hasLogin ? '去发现页关注感兴趣的人' : ''" :action="hasLogin ? '' : '去登录'" @action="goLogin"></hs-empty>
			<view class="loadStyle" v-if="loading && dataList.length">正在加载中</view>
			<view class="loadStyle" v-if="isEnd && dataList.length">我也是有底线的~</view>
			<view class="list-footer"></view>
		</scroll-view>
		<trend-comment :popupShow="popupShow" @popup="popup" :mid="mid" :seed="seed"></trend-comment>
	</view>
</template>

<script>
	import { getAllFollowTrends } from "@/api/interest.js"
	import TrendComment from "@/components/trendComment.vue"
	import { agree, cancelAgree } from "@/api/agreeCollect.js"
	import { timeAgo } from "@/utils/webUtils.js"
	import { mapNoteMedia } from '@/utils/upload.js'
	import { openNote, openUser, currentUid, ensureLogin, noteDeletedMixin } from '@/utils/noteNav.js'
	export default {
		mixins: [noteDeletedMixin],
		components: {
			TrendComment,
		},
		data() {
			return {
				userInfo: {},
				page: 1,
				limit: 10,
				dataList: [],
				popupShow: false,
				isEnd: false,
				loading: false,
				triggered: false,
				total: 0,
				mid: '',
				seed: 0,
				navHeight: 64,
				windowHeight: 667,
				pageHeight: 600,
			}
		},
		computed: {
			hasLogin() {
				return !!currentUid()
			}
		},
		onLoad() {
			this.measurePage()
		},
		onShow() {
			this.measurePage()
			this.userInfo = uni.getStorageSync("userInfo") || {}
			if (!this.hasLogin) {
				this.dataList = []
				this.isEnd = true
				this.loading = false
				return
			}
			if (!this.dataList.length && !this.loading) {
				this.getAllFollowTrends(true)
			}
		},
		onPullDownRefresh() {
			this.getAllFollowTrends(true)
		},
		onReachBottom() {
			this.loadData()
		},
		methods: {
			onNavInit(info) {
				if (info && info.height) {
					this.navHeight = info.height
					this.measurePage()
				}
			},
			measurePage() {
				try {
					const sys = uni.getSystemInfoSync()
					const nav = this.navHeight || (sys.statusBarHeight || 0) + 44
					const windowH = sys.windowHeight || sys.screenHeight || 667
					this.windowHeight = windowH
					this.pageHeight = Math.max(240, windowH - nav)
				} catch (e) {
					this.windowHeight = 667
					this.pageHeight = 600
				}
			},
			pickRecords(res) {
				if (!res || res.data == null) return []
				if (Array.isArray(res.data)) return res.data
				return res.data.records || res.data.list || []
			},
			pickTotal(res) {
				const raw = res && res.data
				if (raw && raw.total != null && raw.total !== '') {
					const n = Number(raw.total)
					if (!isNaN(n) && n >= 0) return n
				}
				return -1
			},
			markEnd(records, list) {
				if (!records.length) {
					this.isEnd = true
					return
				}
				if (this.total >= 0 && list.length >= this.total) {
					this.isEnd = true
					return
				}
				if (records.length < this.limit) {
					this.isEnd = true
					return
				}
				this.isEnd = false
			},
			mapItem(e) {
				const row = mapNoteMedia(Object.assign({}, e, {
					imgsUrl: e.imgsUrl || e.imgUrls || []
				}))
				const ts = typeof e.time === 'number' ? e.time : new Date(e.time).getTime()
				row.time = timeAgo(ts || Date.now())
				row.isLike = !!(e.isLike || e.islike)
				row.likeCount = e.likeCount || 0
				row.commentCount = e.commentCount || 0
				const imgs = Array.isArray(row.imgsUrl) ? row.imgsUrl : []
				row.previewImgs = imgs.slice(0, 3)
				row.moreImgCount = imgs.length > 3 ? imgs.length - 3 : 0
				return row
			},
			onTapComment(index) {
				const item = this.dataList[index]
				if (!item) return
				this.mid = item.nid
				this.seed = Math.random()
				this.popupShow = true
				uni.hideTabBar()
			},
			popup(popupShow) {
				this.popupShow = popupShow
				if (!popupShow) {
					uni.showTabBar()
				}
			},
			getAllFollowTrends(reset) {
				if (!this.hasLogin) {
					this.dataList = []
					this.isEnd = true
					this.loading = false
					this.$nextTick(() => {
						this.triggered = false
					})
					uni.stopPullDownRefresh()
					return
				}
				if (this.loading && !reset) return
				if (reset) {
					this.page = 1
					this.isEnd = false
				}
				this.loading = true
				getAllFollowTrends(this.page, this.limit, {
					uid: currentUid()
				}).then(res => {
					const records = this.pickRecords(res)
					const list = records.map(this.mapItem)
					this.dataList = reset ? list : this.dataList.concat(list)
					this.total = this.pickTotal(res)
					this.markEnd(records, this.dataList)
				}).catch(() => {
					if (reset) this.dataList = []
					this.isEnd = true
				}).then(() => {
					this.loading = false
					this.$nextTick(() => {
						this.triggered = false
					})
					uni.stopPullDownRefresh()
				})
			},
			onRefresh() {
				if (this.triggered) return
				this.triggered = true
				this.getAllFollowTrends(true)
			},
			loadData() {
				if (this.isEnd || this.loading || !this.hasLogin) return
				this.page = this.page + 1
				this.getAllFollowTrends(false)
			},
			onTapUser(index) {
				const item = this.dataList[index]
				if (item) openUser(item.uid)
			},
			onTapNote(index) {
				const item = this.dataList[index]
				if (item) openNote(item.nid)
			},
			goLogin() {
				ensureLogin()
			},
			agreeImg(index) {
				const item = this.dataList[index]
				if (!item || !ensureLogin()) return
				agree({
					uid: currentUid(),
					type: 1,
					likeOrCollectionId: item.nid,
					publishUid: item.uid
				}).then(() => {
					this.$set(this.dataList[index], 'likeCount', (this.dataList[index].likeCount || 0) * 1 + 1)
					this.$set(this.dataList[index], 'isLike', true)
				})
			},
			cancelAgreeImg(index) {
				const item = this.dataList[index]
				if (!item || !ensureLogin()) return
				cancelAgree({
					uid: currentUid(),
					likeOrCollectionId: item.nid,
					publishUid: item.uid,
					type: 1
				}).then(() => {
					this.$set(this.dataList[index], 'likeCount', Math.max(0, (this.dataList[index].likeCount || 0) * 1 - 1))
					this.$set(this.dataList[index], 'isLike', false)
				})
			},
		}
	}
</script>

<style scoped>
	@import url(./interest.css);
</style>
