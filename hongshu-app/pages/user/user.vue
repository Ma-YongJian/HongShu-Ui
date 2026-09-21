<template>
	<view class="content" :style="{ '--mine-nav-h': navHeight + 'px' }">
		<view class="mine-sticky" :class="{ 'is-on': top_show }" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="mine-sticky-bar">
				<view class="mine-sticky-side"></view>
				<view class="mine-sticky-center">
					<view class="fixed-user" v-show="top_show">
						<image :src="avatarSrc" class="avatar" mode="aspectFill" @click="previewImgae(avatarSrc)" />
						<view class="username">{{ userInfo.username }}</view>
					</view>
				</view>
				<view class="mine-sticky-side mine-sticky-right">
					<view class="cover-action" @click="editUserInfo">
						<tui-icon name="manage" :color="top_show ? '#111827' : '#ffffff'" :size="22"></tui-icon>
					</view>
					<view class="cover-action" @click="setting">
						<tui-icon name="setup" :color="top_show ? '#111827' : '#ffffff'" :size="22"></tui-icon>
					</view>
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
						<view class="sub">来因号：{{ userInfo.hsId }}</view>
						<view class="sub">IP属地：{{ userInfo.address }}</view>
					</view>
					<view class="profile-edit" @click="editUserInfo">编辑</view>
				</view>
				<view class="bio">{{ userInfo.description || '这个人什么都没有写～' }}</view>
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
				<view v-if="userInfo && userInfo.id">
					<view class="tab-content" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
						<view v-show="currentTab === 0">
							<Note :uid='userId' @cancelUp='cancelUp' :seed='seed'></Note>
						</view>
						<view v-show="currentTab === 1">
							<Like :seed='seed' :uid='userId'></Like>
						</view>
						<view v-show="currentTab === 2">
							<Collect :uid='userId' :seed='seed'></Collect>
						</view>
					</view>
				</view>
				<view class="nologin" v-else>
					<hs-empty title="登录后查看个人主页" action="去登录" @action="login"></hs-empty>
				</view>
			</view>
		</view>

		<tui-modal :show="show" @click="confirm" @cancel="hide" content="取消上传" :button="radio" width="50%"
			padding="15rpx 40rpx" :fadeIn='true'></tui-modal>

	</view>
</template>

<script>
	// import Trend from "@/pages/user/trends/trends"
	// import Album from "@/pages/user/albums/albums"
	// import Collection from "@/pages/user/collections/collections"
	import Note from "@/pages/user/notes/notes"
	import Like from "@/pages/user/likes/likes"
	import Collect from "@/pages/user/collects/collects"
	import {
		getUserInfo
	} from "@/api/user.js"
	import {
		deleteImgs
	} from '@/api/imgDetail.js'
	import { mediaUrl } from '@/utils/upload.js'
	import { emitNoteDeleted } from '@/utils/noteNav.js'
	export default {
		components: {
			// Trend,
			// Album,
			// Collection
			Note,
			Like,
			Collect
		},
		data() {
			return {
				current: 0,
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
				userId: '',
				show: false,

				radio: [{
						text: '取消',
						type: 'white',
					},
					{
						text: '确定',
						type: 'primary',
					}
				],

				mid: '',

				//页面初始化高度
				screenHeight: 0,

				top_show: false,
				statusBarHeight: 0,
				stickAt: 180,
				vHeight: 0,
				startX: 0, // 记录触摸开始时的X坐标
				startY: 0, // 记录触摸开始时的Y坐标
			}
		},
		onLoad(options) {
			if (typeof options.currentTab != 'undefined' || options.currentTab != null) {
				this.currentTab = options.currentTab
			}
			this.screenHeight = uni.getSystemInfoSync().screenHeight
			this.statusBarHeight = (uni.getSystemInfoSync() || {}).statusBarHeight || 0
			const cached = uni.getStorageSync("userInfo") || {}
			this.userId = cached.id || ''
			if (cached.id) this.userInfo = cached
		},

		onReachBottom() {
			this.seed = Math.random()
		},
		onReady() {
			this.$nextTick(() => this.measureStick())
		},
		onShow() {
			this.getUser()
			this.userId = (uni.getStorageSync("userInfo") || {}).id
			this.$nextTick(() => this.measureStick())
		},
		onPageScroll(e) {
			this._scrollTop = e.scrollTop || 0
			this.top_show = this._scrollTop >= this.stickAt
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
			// 记录触摸开始时的位置
			handleTouchStart(event) {
				this.startX = event.touches[0].pageX;
				this.startY = event.touches[0].pageY;
			},
			// 计算滑动距离，决定是否切换 tab
			handleTouchEnd(event) {
				const endX = event.changedTouches[0].pageX;
				const endY = event.changedTouches[0].pageY;
				const deltaX = endX - this.startX;
				const deltaY = endY - this.startY;
				// 判断滑动的方向和距离
				if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
					// 左右滑动，切换 tab
					if (deltaX < 0 && this.currentTab < this.tabs.length - 1) {
						this.currentTab++;
					} else if (deltaX > 0 && this.currentTab > 0) {
						this.currentTab--;
					}
				}
			},
			// 当 tabs 切换时，更新 currentTab
			changeTab(e) {
				this.currentTab = e.index;
			},
			change(e) {
				this.currentTab = e.index
			},
			setting() {
				uni.navigateTo({
					url: "/pages/setting/setting"
				})
			},


			cancelUp(mid) {
				this.show = true
				this.mid = mid
			},

			confirm(e) {
				if (e.index == 0) {
					this.show = false
					return
				}
				deleteImgs([this.mid]).then(res => {
					if (!res || res.code !== 200) {
						uni.showToast({
							title: (res && (res.message || res.msg)) || '删除失败',
							icon: 'none'
						})
						return
					}
					uni.showToast({
						title: '删除成功',
						icon: 'none'
					})
					this.show = false
					emitNoteDeleted(this.mid)
					this.seed = Math.random()
				})
			},
			hide() {
				this.show = false
			},

			editUserInfo() {
				const cached = uni.getStorageSync("userInfo") || {}
				const uid = this.userId || cached.id
				if (!uid) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					return
				}
				uni.navigateTo({
					url: "/pages/user/info/info?userId=" + uid
				})
			},
			login() {
				uni.navigateTo({
					url: "/pages/login/login"
				})
			},
			getUser() {
				const cached = uni.getStorageSync("userInfo") || {}
				if (!cached.id) {
					return
				}
				getUserInfo({
					userId: cached.id
				}).then(res => {
					if (res.code !== 200 || !res.data) {
						this.userInfo = cached
						this.$nextTick(() => this.measureStick())
						return
					}
					const data = res.data
					this.userInfo = data
					this.userId = data.id || cached.id
					uni.setStorageSync("userInfo", Object.assign({}, cached, data))
					this.$nextTick(() => this.measureStick())
				})
			},

			getAllFriend(type) {
				uni.navigateTo({
					url: "/pages/user/allUser/allUser?type=" + type + "&uid=" + this.userInfo.id
				})
			},

			//-----------------------------------预览图片----------------
			previewImgae(url) {

				let that = this
				let path = []
				path.push(url)

				uni.previewImage({
					current: 0, // 当前显示图片的索引值
					urls: path, // 需要预览的图片列表，photoList要求必须是数组
					longPressActions: {
						itemList: ['保存'],
						success: function(data) {

							//进行保存
							if (data.tapIndex == 0) {
								let p = that.downLoadImg(url)
								p.then((data) => {
									uni.showToast({
										title: data,
										icon: "none"
									});
								})
							}
						},
						fail: function(err) {
							return
						}
					}
				})
			},

			// 保存图片至本地
			downLoadImg(path) {
				//下载图片资源至本地，返回文件的本地临时路径
				return new Promise((resolve, reject) => {
					uni.downloadFile({
						url: path,
						success: (res) => {
							if (res.statusCode === 200) {
								//保存图片至相册
								uni.saveImageToPhotosAlbum({
									filePath: res.tempFilePath,
									success: function() {
										resolve("保存成功")
									},
									fail: function() {
										reject("保存失败")
									}
								});
							}
						}
					})
				})
			},
		}
	}
</script>

<style scoped>
	@import url(./user.css);
</style>