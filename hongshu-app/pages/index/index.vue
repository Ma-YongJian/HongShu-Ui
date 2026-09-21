<template>
	<view class="container" :style="{ '--nav-h': navHeight + 'px' }">
		<!-- 顶部tabs -->
		<hs-nav-bar :showBack="false" :isFixed="true" :placeholder="false" :border="false" :hasRightSlot="true"
			@init="onNavInit">
			<template #left>
				<view class="hs-nav-action nav-menu-btn" @click="openDrawer">
					<view class="nav-menu-line"></view>
					<view class="nav-menu-line"></view>
					<view class="nav-menu-line"></view>
				</view>
			</template>
			<template #center>
				<view class="index-main-tabs">
					<view v-for="(tab, index) in tabs" :key="index" class="index-main-tab"
						:class="{ 'is-active': currentTab === index }" @click="onMainTab(index)">
						<text class="index-main-tab-text">{{ tab.name }}</text>
						<view class="index-main-tab-line"></view>
					</view>
				</view>
			</template>
			<template #right>
				<view class="hs-nav-action" @click="toSearch">
					<tui-icon name="search-2" :size="22" color="#16160e"></tui-icon>
				</view>
			</template>
		</hs-nav-bar>

		<view class="sidebar-mask" v-if="visiable" @click="closeDrawer"></view>
		<view class="sidebar" :class="{ 'is-open': visiable }">
			<scroll-view scroll-y class="sidebar-scroll">
				<view class="menu-card">
					<view class="menu-item" @click="goDrawerPage('/pages/addfriend/addfriend', true)">
						<tui-icon name="friendadd" size="22" color="#333333"></tui-icon>
						<text class="menu-text">发现好友</text>
					</view>
				</view>
				<view class="menu-card">
					<view class="menu-item" @click="goDrawerPage('/pages/history/history', true)">
						<tui-icon name="clock" size="22" color="#333333"></tui-icon>
						<text class="menu-text">浏览记录</text>
					</view>
					<view class="menu-item" @click="goDrawerPage('/pages/message/message-comments/message-comments', true)">
						<tui-icon name="message" size="22" color="#333333"></tui-icon>
						<text class="menu-text">我的评论</text>
					</view>
				</view>
			</scroll-view>
			<view class="sidebar-footer">
				<view class="footer-btn" @click="goDrawerPage('/pages/setting/setting', false)">
					<view class="footer-icon">
						<tui-icon name="setup" size="22" color="#666666"></tui-icon>
					</view>
					<text class="footer-text">设置</text>
				</view>
			</view>
		</view>

		<view @touchstart="start" @touchend="end">
			<follow v-if="currentTab == 0"></follow>
			<hot v-if="currentTab == 2"></hot>
			<view v-show="currentTab == 1">
				<scroll-view scroll-y class="page" @scrolltolower="loadData" refresher-enabled="true"
					:refresher-triggered="triggered" @refresherrefresh="onRefresh" @scroll="scroll"
					:scroll-top="scrollTop">
					<view class="cat-bar">
						<scroll-view scroll-x class="cat-scroll" enhanced :show-scrollbar="false"
							:scroll-into-view="catIntoView" scroll-with-animation>
							<view class="cat-row">
								<view class="cat-item" v-for="(item, index) in categoryList" :id="item.viewId"
									:key="index" :class="{ on: index == C }" @click="onChooseCat(index)">
									{{ item.title }}
								</view>
							</view>
						</scroll-view>
						<view class="cat-more" @click="show">
							<tui-icon :name="T ? 'arrowdown' : 'arrowup'" :size="18" color="#666666"></tui-icon>
						</view>
					</view>
					<view class="cat-panel" v-if="!T">
						<view class="cat-grid">
							<view class="cat-grid-item" v-for="(item, index) in categoryList" :key="index"
								:class="{ on: index == C }" @click="onChooseCat(index)">
								{{ item.title }}
							</view>
						</view>
					</view>
					<!-- 数据展示使用瀑布流 -->
					<view class="main">
						<uv-waterfall ref="waterfall" v-model="list" column-count="2" :add-time="0"
							@changeList="changeList" column-gap="8">
							<template v-slot:list1>
								<view>
							<hs-note-card v-for="(item, index) in list1" :key="index" :item="item"
								@click="getImgInfo" @user="goCardUser"></hs-note-card>
								</view>
							</template>
							<template v-slot:list2>
								<view>
							<hs-note-card v-for="(item, index) in list2" :key="index" :item="item"
								@click="getImgInfo" @user="goCardUser"></hs-note-card>
								</view>
							</template>
						</uv-waterfall>
						<hs-empty v-if="!loading && !list.length" title="暂无笔记" tip="换个分类看看，或去发布第一条"></hs-empty>
					</view>
					<view class="loadStyle" v-if="!isEnd && loading">
						<tui-icon name="loading" :size="18"></tui-icon>
					</view>
					<view class="loadStyle" v-if="isEnd && list.length">我也是有底线的~</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		loginOut
	} from "@/api/login.js"
	import {
		tokenUtil
	} from "@/utils/token.js"
	import {
		getPage,
		getRecommend
	} from "@/api/imgDetail.js"
	import {
		addBrowseRecord
	} from "@/api/browseRecord.js"

	import {
		getCategory,
		getImgListByCategory
	} from '@/api/category.js'
	import {
		getChatUserList
	} from '@/api/chat.js'
	import {
		getUserRecord
	} from "@/api/user.js"
	import {
		mapNoteMedia
	} from '@/utils/upload.js'
	import {
		openNote,
		openUser,
		ensureLogin,
		noteDeletedMixin
	} from '@/utils/noteNav.js'
	import { messageTabIndex } from '@/utils/tabbar.js'
	import Hot from '@/pages/index/hot/hot.vue'
	import Follow from '@/pages/index/follow/follow.vue'
	export default {
		mixins: [noteDeletedMixin],
		components: {
			Hot,
			Follow
		},
		props: {
			seed: Number
		},
		data() {
			return {
				currentTab: 1,
				tabs: [{
					name: "关注"
				}, {
					name: "发现"
				}, {
					name: "热榜"
				}],
				T: true,
				C: -1,
				visiable: false,
				triggered: false,
				userInfo: {},
				page: 1,
				limit: 10,
				size: 50,
				total: 0,
				isEnd: false, //是否到底底部了
				loading: false, //是否正在加载
				keyword: '',
				categoryList: [],
				categoryIndex: 0,
				catIntoView: '',
				startData: null, // 触摸开始时的数据
				allowSwipe: false, // 控制是否允许滑动的标志
				isSwiping: false, // 标记是否在分类栏滑动
				isSearchByCategory: false,
				isFirst: false,
				noteId: '',
				cid: '',
				cpid: '',
				//滚动
				scrollTop: 0,
				old: {
					scrollTop: 0
				},
				isFixed: false,
				startData: {},
				list: [], //瀑布流总数据
				list1: [], // 瀑布流第一列数据
				list2: [], // 瀑布流第二列数据
				needRefresh: false,
				stickyScrollTop: 0,
				navHeight: 44,
			}
		},
		watch: {
			seed(newVal, oldVal) {
				this.userInfo = uni.getStorageSync("userInfo")
			},
		},
		onPageScroll(e) {
			this.stickyScrollTop = e.stickyScrollTop
		},
		created() {
			this.getCategory()
			this.loadUserInfo()
			this.getRecordCount()
			this.onRefresh()
		},
		
		onShow() {
			// 每次页面显示时重新加载用户信息，确保头像更新
			this.loadUserInfo()
		},

		onHide() {
			this.needRefresh = false
		},

		onTabItemTap() {
			if (this.needRefresh && this.currentTab === 1) {
				this.onRefresh()
			}
			this.needRefresh = true
		},

		methods: {
			onNavInit(e) {
				if (e && e.height) {
					this.navHeight = e.height
				}
			},
			loadUserInfo() {
				this.userInfo = uni.getStorageSync("userInfo")
				getApp().globalData.currentUser = this.userInfo;
				// 如果没有用户信息，尝试从全局获取
				if (!this.userInfo && getApp().globalData.currentUser) {
					this.userInfo = getApp().globalData.currentUser
				}
			},
			
			handleAvatarError(e) {
				// 头像加载失败时使用默认头像
				this.userInfo.avatar = '/static/images/toast/img_nodata.png'
			},
			
			loginOut() {
				loginOut(this.currentUser).then(res => {
					uni.removeStorageSync("userInfo")
					tokenUtil.clear()
					setTimeout(() => {
						uni.reLaunch({
							url: "/pages/login/login"
						});
					}, 500)
				})
			},

			change(e) {
				this.currentTab = e.index
				this.clear();
				this.onRefresh();
			},
			onMainTab(index) {
				this.change({ index })
			},

			handleTouchStart(e) {
				if (this.allowSwipe) {
					return; // 如果不允许滑动，直接返回
				}
				this.startData = {
					clientX: e.changedTouches[0].clientX,
					clientY: e.changedTouches[0].clientY
				};
				this.isSwiping = false; // 重置滑动状态
			},

			handleTouchEnd(e) {
				if (this.allowSwipe) {
					return; // 如果不允许滑动，直接返回
				}
				const endData = {
					clientX: e.changedTouches[0].clientX,
					clientY: e.changedTouches[0].clientY
				};
				const deltaX = endData.clientX - this.startData.clientX;
				const deltaY = endData.clientY - this.startData.clientY;
				// 检测滑动方向
				if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
					this.isSwiping = true;
				} else {
					this.isSwiping = false; // 非滑动操作
				}
				// 如果是滑动，则不切换分类
				if (this.isSwiping) {
					e.preventDefault(); // 防止默认行为
				}
			},

			start(e) {
				this.startData.clientX = e.changedTouches[0].clientX;
				this.startData.clientY = e.changedTouches[0].clientY;
			},

			end(e) {
				const subX = e.changedTouches[0].clientX - this.startData.clientX;
				const subY = e.changedTouches[0].clientY - this.startData.clientY;
				if (!this.isFixed) {
					if (Math.abs(subX) > Math.abs(subY) && Math.abs(subX) > 50) {
						if (subY > 100 || subY < -100) {
							//console.log('上下滑')
						} else {
							if (subX > 100) {
								if (this.currentTab > 0) {
									this.currentTab = this.currentTab - 1
								}
							} else if (subX < -100) {
								if (this.currentTab < 2) {
									this.currentTab = this.currentTab + 1
								}
							}
						}
					}
				} else {
					if (subX > 100) {
						// 向右滑动，切换到前一个分类
						if (this.categoryIndex > 0) {
							this.categoryIndex--;
							this.updateCategory();
						}
					} else if (subX < -100) {
						// 向左滑动，切换到下一个分类
						if (this.categoryIndex < this.categoryList.length - 1) {
							this.categoryIndex++;
							this.updateCategory();
						}
					}
				}
			},

			updateCategory() {
				this.C = this.categoryIndex;
				this.getImgListByCategory(this.categoryList[this.C].id, this.C);
				// 自动滚动到当前分类
				this.scrollToCategory(this.C);
			},

			onChooseCat(index) {
				const item = this.categoryList[index]
				if (!item) return
				this.getImgListByCategory(item.id, index)
			},
			scrollToCategory(index) {
				this.catIntoView = ''
				this.$nextTick(() => {
					this.catIntoView = 'cat' + index
				})
			},

			// getChatUserList() {
			// 	return new Promise((resolve) => {
			// 		let params = {
			// 			uid: uni.getStorageSync("userInfo").id
			// 		}
			// 		getChatUserList(params).then(res => {
			// 			let count = 0
			// 			res.data.forEach(item => {
			// 				if (item.count > 0) {
			// 					count += item.count
			// 				}
			// 			})
			// 			resolve(count)
			// 		})
			// 	})
			// },

			getUserRecord() {
				return new Promise((resolve) => {
					// let params = {
					// 	uid: uni.getStorageSync("userInfo").id
					// }
					getUserRecord().then(res => {
						resolve(res.data)
					})
				})
			},

			async getRecordCount() {
				//let count = await this.getChatUserList()
				let res = await this.getUserRecord()
				let count = uni.getStorageSync("unreadTotal")
				if (res.agreeCollectionCount > 0 || res.addFollowCount > 0 || res.noreplyCount > 0 || count > 0) {
					uni.showTabBarRedDot({
						index: messageTabIndex()
					})
				} else {
					uni.hideTabBarRedDot({
						index: messageTabIndex()
					})
				}
			},

			show() {
				this.T = !this.T
				if (this.T) {
					// 分类收起，允许滑动
					this.allowSwipe = true;
				} else {
					// 分类展开，不允许滑动
					this.allowSwipe = false;
				}
			},

			openDrawer() {
				this.visiable = true
				uni.hideTabBar({
					fail: () => {}
				})
			},
			closeDrawer() {
				this.visiable = false
				uni.showTabBar({
					fail: () => {}
				})
			},
			goDrawerPage(url, needLogin) {
				if (needLogin && !ensureLogin()) {
					this.closeDrawer()
					return
				}
				this.closeDrawer()
				uni.navigateTo({
					url
				})
			},

			scroll(e) {
				this.old.scrollTop = e.detail.scrollTop
				this.isFixed = e.detail.scrollTop > 50
			},

			getCategory() {
				getCategory().then(res => {
					const list = [{
						id: 0,
						title: '推荐'
					}].concat((res && res.data) || [])
					this.categoryList = list.map((item, index) => {
						item.viewId = 'cat' + index
						return item
					})
				})
			},

			getMoreData(dataList) {
				const records = dataList || []
				if (!records.length) return
				this.$nextTick(() => {
					const newList = records.map(item => this.getItem(item));
					this.list = this.list.concat(newList);
				});
			},

			getItem(item) {
				const mapped = mapNoteMedia(Object.assign({}, item))
				return {
					id: mapped.id || mapped.nid,
					uid: mapped.uid,
					noteCover: mapped.noteCover,
					image: mapped.noteCover,
					title: mapped.title,
					content: mapped.title,
					count: mapped.count,
					avatar: mapped.avatar,
					username: mapped.username,
					isLike: mapped.isLike,
					agreeCount: mapped.likeCount,
					viewCount: mapped.viewCount,
					noteCoverHeight: mapped.noteCoverHeight || mapped.height,
					noteType: mapped.noteType
				}
			},

			getImgListByCategory(id, index) {
				if (this.isSwiping) {
					return;
				}
				this.C = index;
				this.clear();
				this.cpid = id;
				this.loading = true
				if (index === 0) {
					this.getRecommend();
					return
				}
				let params = {
					keyword: "",
					cid: "",
					cpid: id,
					type: 1,
				}
				this.page = 1
				getImgListByCategory(this.page, this.limit, params).then(res => {
					this.isSearchByCategory = true
					this.T = true
					this.total = res.data.total
					this.getMoreData(res.data.records)
					this.loading = false
					this.scrollToCategory(this.C);
				}).catch(() => {
					this.loading = false
				})
			},

			getPage() {
				let params = {}
				getPage(this.page, this.limit, params).then(res => {
					this.total = res.data.total
					this.getMoreData(res.data.records)
				})
			},

			onRefresh() {
				this.C = 0
				this.T = true
				this.isFixed = false
				this.triggered = true;
				this.isEnd = false
				setTimeout(() => {
					this.triggered = false;
					this.clear()
					this.page = 1
					this.isSearchByCategory = false
					this.getRecommend()
				}, 500)
				// 分类重置到推荐
				this.categoryIndex = this.C;
				this.scrollToCategory(this.C);
			},

			clear() {
				this.list = [];
				this.list1 = [];
				this.list2 = [];
				this.page = 1;
				this.isEnd = false;
				if (this.$refs.waterfall) {
					this.$refs.waterfall.clear(); // 确保瀑布流组件的数据也被清空
				}
			},

			getRecommend() {
				let params = {
					uid: this.userInfo.id
				}
				getRecommend(this.page, this.limit, params).then(res => {
					if (res.data == null) {
						this.isFirst = true
						this.getPage()
					} else {
						this.total = res.data.total
						this.getMoreData(res.data.records)
						this.loading = false;
						if (this.list.length >= this.total) {
							this.isEnd = true;
						}
					}
				})
			},

			changeList(e) {
				const name = e.name
				const value = e.value
				if (!name || !value || !this[name]) return
				if (value.id && this[name].some(item => item.id === value.id)) return
				this[name].push(value)
			},

			loadData() {
				this.loading = true
				setTimeout(() => {
					if (this.isFirst || this.isSearchByCategory) {
						if (this.list.length >= this.total) {
							this.isEnd = true
							return
						}
					} else {
						if (this.total == 0) {
							this.isEnd = true
							return
						}
					}
					this.page = this.page + 1;
					if (this.isSearchByCategory) {
						let params = {
							keyword: "",
							cid: "",
							cpid: this.cpid,
							type: 1,
						}
						getImgListByCategory(this.page, this.limit, params).then(res => {
							this.getMoreData(res.data.records)
						})
					} else {
						let params = {
							uid: this.userInfo.id
						}
						getRecommend(this.page, this.limit, params).then(res => {
							if (res.data == null) {
								getPage(this.page, this.limit, params).then(res => {
									this.getMoreData(res.data.records)
									this.total = res.data.total
								})
							} else {
								this.getMoreData(res.data.records)
								this.total = res.data.total
							}
						})
					}
				}, 500)
			},

			getImgInfo(item) {
				this.isFirst = false
				openNote(item)
			},
			goCardUser(item) {
				openUser(item && item.uid)
			},
			toSearch() {
				uni.navigateTo({
					url: "/pages/index/search/search"
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./index.css);
</style>