<template>
	<view class="content" :style="{ '--mine-nav-h': navHeight + 'px' }">
		<view class="mine-sticky" :class="{ 'is-on': top_show }" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="mine-sticky-bar">
				<view class="mine-sticky-side">
					<view class="cover-btn" @click="back">
						<tui-icon name="arrowleft" :color="top_show ? '#111827' : '#ffffff'" :size="22"></tui-icon>
					</view>
				</view>
				<view class="mine-sticky-center">
					<view class="fixed-user" v-show="top_show">
						<image :src="avatarSrc" class="avatar" mode="aspectFill" />
						<view class="username">{{ userInfo.username }}</view>
					</view>
				</view>
				<view class="mine-sticky-side mine-sticky-right">
					<view class="nav-chat" :class="{ 'is-light': !top_show }" @click="chat">私信</view>
				</view>
			</view>
		</view>

		<view class="cover">
			<image :src="coverSrc" mode="aspectFill" @click="previewImgae(coverSrc)" />
		</view>

		<view class="main">
			<view class="profile-head">
				<view class="profile-row">
					<image :src="avatarSrc" class="profile-avatar" mode="aspectFill"
						@error="onAvatarError" @click="previewImgae(avatarSrc)" />
					<view class="profile-meta">
						<view class="name">{{ userInfo.username }}</view>
						<view class="sub">来因号：{{ userInfo.hsId || '-' }}</view>
						<view class="sub">IP属地：{{ userInfo.address || '未知' }}</view>
					</view>
				</view>
				<view class="bio">{{ userInfo.description || '这个人什么都没有写～' }}</view>
				<view class="stats-row">
					<view class="stats">
						<view class="stat" @click="getAllFriend(1)">
							<text class="stat-num">{{ userInfo.followerCount || 0 }}</text>
							<text class="stat-label">关注</text>
						</view>
						<view class="stat" @click="getAllFriend(0)">
							<text class="stat-num">{{ userInfo.fanCount || 0 }}</text>
							<text class="stat-label">粉丝</text>
						</view>
						<view class="stat">
							<text class="stat-num">{{ userInfo.trendCount || 0 }}</text>
							<text class="stat-label">动态</text>
						</view>
					</view>
					<view class="profile-actions">
						<view class="btn-chat" @click="chat">私信</view>
						<view class="btn-follow" :class="{ 'is-on': followed }" @click="toggleFollow">
							{{ followed ? '已关注' : '关注' }}
						</view>
					</view>
				</view>
			</view>

			<view class="mine-tabs-ph" v-show="top_show"></view>
			<view id="mineTabs" class="mine-tabs" :class="{ 'is-pinned': top_show }"
				:style="tabsPinStyle">
				<view class="mine-tab" v-for="(tab, index) in tabs" :key="index"
					:class="{ 'is-active': currentTab === index }" @click="switchTab(index)">
					<text class="mine-tab-text">{{ tab.name }}</text>
					<view class="mine-tab-line"></view>
				</view>
			</view>

			<view class="zhuti">
				<view class="tab-content" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
					<view v-show="currentTab === 0">
						<Note :uid="uid" :seed="seed"></Note>
					</view>
					<view v-show="currentTab === 1">
						<Like :uid="uid" :seed="seed"></Like>
					</view>
					<view v-show="currentTab === 2">
						<Collect :uid="uid" :seed="seed"></Collect>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import Note from "@/pages/user/notes/notes"
	import Like from "@/pages/user/likes/likes"
	import Collect from "@/pages/user/collects/collects"
	import {
		getUserInfo
	} from "@/api/user.js"
	import {
		isFollow,
		followUser
	} from "@/api/follow.js"
	import {
		mediaUrl
	} from '@/utils/upload.js'
	import {
		tokenUtil
	} from '@/utils/token.js'

	export default {
		components: {
			Note,
			Like,
			Collect
		},
		data() {
			return {
				currentTab: 0,
				tabs: [{
					name: "作品"
				}, {
					name: "点赞"
				}, {
					name: "收藏"
				}],
				userInfo: {},
				seed: 0,
				uid: '',
				followed: false,
				top_show: false,
				statusBarHeight: 0,
				stickAt: 180,
				startX: 0,
				startY: 0
			}
		},
		computed: {
			navHeight() {
				return (Number(this.statusBarHeight) || 0) + 44
			},
			avatarSrc() {
				const u = this.userInfo || {}
				return mediaUrl(u.avatar || u.avatarUrl)
			},
			coverSrc() {
				const u = this.userInfo || {}
				if (!u.userCover) return '/static/images/toast/img_nodata.png'
				return mediaUrl(u.userCover)
			},
			tabsPinStyle() {
				if (!this.top_show) return ''
				return 'top:' + this.navHeight + 'px'
			}
		},
		onLoad(option) {
			try {
				this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
			} catch (e) {
				this.statusBarHeight = 0
			}
			if (option && option.currentTab != null && option.currentTab !== '') {
				this.currentTab = Number(option.currentTab) || 0
			}
			this.uid = (option && option.uid) || ''
			if (!this.uid) {
				uni.showToast({
					title: '用户不存在',
					icon: 'none'
				})
				setTimeout(() => {
					this.back()
				}, 400)
				return
			}
			const me = uni.getStorageSync('userInfo') || {}
			if (me.id && String(me.id) === String(this.uid)) {
				uni.switchTab({
					url: '/pages/user/user'
				})
			}
		},
		onReady() {
			this.$nextTick(() => this.measureStick())
		},
		onShow() {
			if (!this.uid) return
			this.loadUser()
			this.loadFollow()
			this.seed = Math.random()
			this.$nextTick(() => this.measureStick())
		},
		onPageScroll(e) {
			this._scrollTop = e.scrollTop || 0
			this.top_show = this._scrollTop >= this.stickAt
		},
		onReachBottom() {
			this.seed = Math.random()
		},
		methods: {
			switchTab(index) {
				this.currentTab = index
			},
			measureStick() {
				if (this.top_show) return
				uni.createSelectorQuery().in(this)
					.select('#mineTabs')
					.boundingClientRect()
					.exec((res) => {
						const rect = res && res[0]
						if (!rect) return
						const scrollTop = this._scrollTop || 0
						this.stickAt = Math.max(80, Math.round(rect.top + scrollTop - this.navHeight))
					})
			},
			onAvatarError() {
				this.$set(this.userInfo, 'avatar', '/static/logo.png')
			},
			handleTouchStart(event) {
				this.startX = event.touches[0].pageX
				this.startY = event.touches[0].pageY
			},
			handleTouchEnd(event) {
				const endX = event.changedTouches[0].pageX
				const endY = event.changedTouches[0].pageY
				const deltaX = endX - this.startX
				const deltaY = endY - this.startY
				if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
					if (deltaX < 0 && this.currentTab < this.tabs.length - 1) {
						this.currentTab++
					} else if (deltaX > 0 && this.currentTab > 0) {
						this.currentTab--
					}
				}
			},
			changeTab(e) {
				this.currentTab = e.index
			},
			back() {
				uni.navigateBack({
					fail: () => {
						uni.switchTab({
							url: '/pages/index/index'
						})
					}
				})
			},
			ensureLogin() {
				const token = tokenUtil.get()
				const me = uni.getStorageSync('userInfo') || {}
				if (token && me.id) return true
				uni.navigateTo({
					url: '/pages/login/login'
				})
				return false
			},
			loadUser() {
				getUserInfo({
					userId: this.uid
				}).then(res => {
					if (res.code === 200 && res.data) {
						this.userInfo = res.data
						this.$nextTick(() => this.measureStick())
					} else {
						uni.showToast({
							title: '用户不存在',
							icon: 'none'
						})
					}
				})
			},
			loadFollow() {
				if (!tokenUtil.get() || !this.uid) return
				isFollow({
					followerId: this.uid
				}).then(res => {
					this.followed = !!res.data
				}).catch(() => {
					this.followed = false
				})
			},
			chat() {
				if (!this.ensureLogin()) return
				const uid = this.userInfo.id || this.uid
				if (!uid) return
				uni.navigateTo({
					url: "/pages/chat/chat2?toUid=" + uid
				})
			},
			toggleFollow() {
				if (!this.ensureLogin()) return
				const fid = this.userInfo.id || this.uid
				if (!fid) return
				const next = !this.followed
				followUser({
					followerId: fid
				}).then(res => {
					if (res.code === 200) {
						this.followed = next
						const fans = Number(this.userInfo.fanCount || 0)
						this.$set(this.userInfo, 'fanCount', Math.max(0, fans + (next ? 1 : -1)))
						this.loadUser()
					} else {
						uni.showToast({
							title: res.message || '操作失败',
							icon: 'none'
						})
					}
				})
			},
			getAllFriend(type) {
				uni.navigateTo({
					url: "/pages/user/allUser/allUser?type=" + type + "&uid=" + this.uid
				})
			},
			previewImgae(url) {
				if (!url || url.indexOf('/static/') === 0) return
				let that = this
				uni.previewImage({
					current: 0,
					urls: [url],
					longPressActions: {
						itemList: ['保存'],
						success: function(data) {
							if (data.tapIndex == 0) {
								that.downLoadImg(url).then((msg) => {
									uni.showToast({
										title: msg,
										icon: "none"
									})
								})
							}
						},
						fail: function() {}
					}
				})
			},
			downLoadImg(path) {
				return new Promise((resolve, reject) => {
					uni.downloadFile({
						url: path,
						success: (res) => {
							if (res.statusCode === 200) {
								uni.saveImageToPhotosAlbum({
									filePath: res.tempFilePath,
									success: function() {
										resolve("保存成功")
									},
									fail: function() {
										reject("保存失败")
									}
								})
							} else {
								reject("保存失败")
							}
						},
						fail: () => reject("保存失败")
					})
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./otherUser.css);
</style>
