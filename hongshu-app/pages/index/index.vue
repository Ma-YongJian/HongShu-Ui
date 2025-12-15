<template>
	<view class="container">
		<!-- 顶部tabs -->
		<tui-navigation-bar backgroundColor="#fff" :isFixed="true" :isOpacity="false">
			<tui-tabs :tabs="tabs" :currentTab="currentTab" itemWidth="50%" @change="change" sliderBgColor="#ff0000"
				selectedColor="#ff0000">
			</tui-tabs>
		</tui-navigation-bar>

		<view @touchstart="start" @touchend="end">
			<follow v-if="currentTab == 0"></follow>
			<hot v-if="currentTab == 2"></hot>
			<view v-if="currentTab == 1">
				<scroll-view scroll-y class="page" @scrolltolower="loadData" refresher-enabled="true"
					:refresher-triggered="triggered" @refresherrefresh="onRefresh" @scroll="scroll"
					:scroll-top="scrollTop">
					<!-- 左侧状态栏 -->
					<view>
						<tui-drawer mode="left" :visible="visiable" @close="closeDrawer">
							<view class="d-container">
								<view class="d-content">
									<view class="find-user">
										<navigator url="/pages/addfriend/addfriend">
											<view class="item">
												<tui-icon name="friendadd" size="20"></tui-icon>
												发现好友
											</view>
										</navigator>
									</view>
									<view class="d-function">
										<ul>
											<li>
												<navigator url="/pages/history/history">
													<view class="item">
														<tui-icon name="clock" size="20"></tui-icon>
														浏览记录
													</view>
												</navigator>
											</li>
										</ul>
									</view>
									<view class="d-function">
										<ul>
											<li>
												<navigator url="/pages/history/history">
													<view class="item">
														<tui-icon name="clock" size="20"></tui-icon>
														我的评论
													</view>
												</navigator>
											</li>
										</ul>
									</view>
								</view>
							</view>
							<view class="item footer-item">
								<navigator url="/pages/setting/setting">
									<view class="icon-text-container">
										<tui-icon name="setup" class="icon-item-setup" color="#393939"
											size="30"></tui-icon>
										<text class="icon-text">设置</text>
									</view>
								</navigator>
							</view>
						</tui-drawer>
					</view>
					<!-- 头像框和搜索栏 -->
					<view class="tui-content-box">
						<view class="tui-avatar-box">
							<view @click="openDrawer" v-if="userInfo && userInfo.avatar">
								<image :src="userInfo.avatar" class="tui-avatar" mode="aspectFill" @error="handleAvatarError" />
							</view>
							<view v-else @click="openDrawer">
								<image src="/static/images/toast/img_nodata.png" class="tui-avatar" mode="aspectFill" />
							</view>
						</view>
						<view class="tui-search-box" @click="toSearch">
							<tui-icon name="search-2" :size="18" color="#bfbfbf"></tui-icon>
							<view class="tui-search-text">请输入搜索内容</view>
						</view>
					</view>
					<!-- 分类 -->
					<!-- <view :class="isFixed?'tui-mtop-fixed':'tui-mtop' " id='tui-mtop'> -->
						<view :class="'tui-mtop'" >
						<view class="nav" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
							<ul>
								<li v-for="(item, index) in categoryList" :key="index" :ref="'category-' + index">
									<a @click="getImgListByCategory(item.id,index)">
										<view :class="index==C?'c-activated':''">{{item.title}}</view>
									</a>
								</li>
							</ul>
						</view>
						<a>
							<tui-icon name="arrowdown" size="20" color="#666666" @click="show" v-if="T">
							</tui-icon>
							<tui-icon name="arrowup" size="20" color="#666666" @click="show" v-else>
							</tui-icon>
						</a>
						<view class="nav-show" :class="T ? 'box-show' : ''">
							<ul>
								<li v-for="(item, index) in categoryList" :key="index" v-show="index>=7"
									:ref="'category-' + index">
									<a @click="getImgListByCategory(item.id,index)">
										<view :class="index==C?'c-activated':''">{{item.title}}</view>
									</a>
								</li>
							</ul>
						</view>
					</view>
					<!-- 数据展示使用瀑布流 -->
					<view class="main">
						<uv-waterfall ref="waterfall" v-model="list" column-count="2" @changeList="changeList"
							column-gap="8">
							<template v-slot:list1>
								<!-- 为了磨平部分平台的BUG，必须套一层view -->
								<view>
									<uni-list :data="list1" :total='list1.length' style="background-color: #f4f4f4;">
										<view v-for="(item, index) in list1" :key="index" class="waterfall-item">

											<view class="waterfall-item__image">
												<image :src="item.noteCover" :lazy-load="true" mode="widthFix"
													:width="item.width+'px'" @click="getImgInfo(item.id)">
												</image>
											</view>
											<view class="card">
												<view class="cont">
													<view class="content">{{item.content}}
													</view>
													<view class="userInfo">
														<view class="avatar-usrname">
															<image :src="item.avatar" :lazy-load="true"
																mode="aspectFill" class="avatar"></image>
															<view class="username">{{ item.username }}</view>
														</view>
														<view class="agreeCount">
															<tui-icon name="like" size="14"
																v-if="!item.isLike"></tui-icon>
															<tui-icon name="like-fill" size="14" v-else
																style="color: red;"></tui-icon>
															{{ item.agreeCount }}
														</view>
													</view>
													<view class="card-nums">
														<tui-icon name="eye" size="15"
															style="color: floralwhite;"></tui-icon>
														{{item.viewCount}}
													</view>
												</view>
											</view>
										</view>
									</uni-list>
								</view>
							</template>
							<!-- 第二列数据 -->
							<template v-slot:list2>
								<!-- 为了磨平部分平台的BUG，必须套一层view -->
								<view>
									<uni-list :data='list2' :total='list2.length' style="background-color: #f4f4f4;">
										<view v-for="(item, index) in list2" :key="index" class="waterfall-item">
											<view class="waterfall-item__image">
												<image :src="item.noteCover" :lazy-load="true" mode="widthFix"
													:width="item.width+'px'" @click="getImgInfo(item.id)">
												</image>
											</view>
											<view class="card">
												<view class="cont">
													<view class="content">{{item.content}}</view>
													<view class="userInfo">
														<view class="avatar-usrname">
															<image :src="item.avatar" :lazy-load="true"
																mode="aspectFill" class="avatar"></image>
															<view class="username">{{ item.username }}</view>
														</view>
														<view class="agreeCount">
															<tui-icon name="like" size="14"
																v-if="!item.isLike"></tui-icon>
															<tui-icon name="like-fill" size="14" v-else
																style="color: red;"></tui-icon>
															{{ item.agreeCount }}
														</view>
													</view>
													<view class="card-nums">
														<tui-icon name="eye" size="15"
															style="color: floralwhite;"></tui-icon>
														{{item.viewCount}}
													</view>
												</view>
											</view>
										</view>
									</uni-list>
								</view>
							</template>
						</uv-waterfall>
					</view>
					<view class="loadStyle" v-if="!isEnd && loading">
						<tui-icon name="loading" :size="18"></tui-icon>
					</view>
					<view class="loadStyle" v-if="isEnd">我也是有底线的~</view>
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
	import Hot from '@/pages/index/hot/hot.vue'
	import Follow from '@/pages/index/follow/follow.vue'
	export default {
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
				categoryIndex: 0, // 当前显示的分类索引
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

		onTabItemTap(e) {
			this.currentTab = 1
			if (this.needRefresh) {
				uni.pageScrollTo({ // 回到顶部
					duration: 0,
					scrollTop: 0
				})
				this.onRefresh()
			} else {
				this.needRefresh = true
			}
		},

		methods: {
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

			scrollToCategory(index) {
				const categoryRef = this.$refs[`category-${index}`];
				if (categoryRef && categoryRef[0]) {
					const categoryElement = categoryRef[0];
					categoryElement.scrollIntoView({
						behavior: "smooth",
						block: "nearest",
						inline: "center"
					});
				}
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
					uni.showTabBarRedDot({ //显示红点
						index: 2 //tabbar下标
					})
				} else {
					uni.hideTabBarRedDot({
						index: 2
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
				this.T = true
				this.visiable = true
			},

			closeDrawer() {
				this.visiable = false
			},

			scroll(e) {
				this.old.scrollTop = e.detail.scrollTop
				if (e.detail.scrollTop > 50) {
					// this.isFixed = true
					this.isFixed = false
				} else {
					// this.isFixed = false
					this.isFixed = true
				}
			},

			getCategory() {
				getCategory().then(res => {
					this.categoryList = [{
							id: 0,
							title: '推荐'
						},
						...res.data
					];
				})
			},

			getMoreData(dataList) {
				this.$nextTick(() => {
					const newList = dataList.map(item => this.getItem(item));
					this.list.push(...newList);
				});
			},

			getItem(item) {
				return {
					id: item.id,
					noteCover: item.noteCover,
					image: JSON.parse(item.urls),
					content: item.title,
					count: item.count,
					avatar: item.avatar,
					username: item.username,
					isLike: item.isLike,
					agreeCount: item.likeCount,
					viewCount: item.viewCount
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
				try {
					// 推荐列表
					if (index === 0) {
						this.getRecommend();
					} else {
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
						})
						// 自动滚动到当前分类
						this.scrollToCategory(this.C);
					}
				} catch (error) {
					console.error("获取分类数据失败", error);
				} finally {
					this.loading = false;
				}
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
				this[e.name].push(e.value);
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

			getImgInfo(mid) {
				this.isFirst = false
				//添加一条浏览记录
				let data = {}
				data.uid = this.userInfo.id
				data.nid = mid
				addBrowseRecord(data).then(res => {
					uni.navigateTo({
						url: "/pages/main/main?mid=" + mid
					})
				})
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