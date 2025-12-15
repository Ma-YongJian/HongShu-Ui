<template>
	<view class="container">
		<scroll-view scroll-y class="page" @scrolltolower="loadData" refresher-enabled="true"
			:refresher-triggered="triggered" @refresherrefresh="onRefresh" @scroll="scroll" :scroll-top="scrollTop">

			<!-- 使用瀑布流 -->
			<view class="main">
				<uv-waterfall ref="waterfall" v-model="list" column-count="2" @changeList="changeList" column-gap="8">
					<template v-slot:list1>
						<!-- 为了磨平部分平台的BUG，必须套一层view -->
						<view>
							<uni-list :data="list1" :total='list1.length' style="background-color: #f4f4f4;">
								<view v-for="(item, index) in list1" :key="index" class="waterfall-item">

									<view class="waterfall-item__image">
										<image :src="item.image" :lazy-load="true" mode="widthFix"
											:width="item.width+'px'" @click="getImgInfo(item.id)">
										</image>
									</view>
									<view class="card">

										<view class="cont">
											<view class="content">{{item.content}}
											</view>
											<view class="userInfo">
												<view class="avatar-usrname">
													<image :src="item.avatar" :lazy-load="true" mode="aspectFill"
														class="avatar"></image>
													<view class="username">{{ item.username }}</view>
												</view>
												<view class="agreeCount">
													<tui-icon name="like" size="15" v-if="!item.isLike"></tui-icon>
													<tui-icon name="like-fill" size="15" v-else
														style="color: red;"></tui-icon>
													<!-- <tui-icon name="like" size="15" style="margin-right: 3px;"></tui-icon> -->
													{{ item.agreeCount }}
												</view>
											</view>
											<view class="card-nums">
												<tui-icon name="eye" size="15" style="color: floralwhite;"></tui-icon>
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
										<image :src="item.image" :lazy-load="true" mode="widthFix"
											:width="item.width+'px'" @click="getImgInfo(item.id)">
										</image>
									</view>
									<view class="card">

										<view class="cont">
											<view class="content">{{item.content}}</view>
											<view class="userInfo">
												<view class="avatar-usrname">
													<image :src="item.avatar" :lazy-load="true" mode="aspectFill"
														class="avatar"></image>
													<view class="username">{{ item.username }}</view>
												</view>
												<view class="agreeCount">
													<tui-icon name="like" size="15" v-if="!item.isLike"></tui-icon>
													<tui-icon name="like-fill" size="15" v-else
														style="color: red;"></tui-icon>
													<!-- <tui-icon name="like"
															style="margin-right: 3px;" size="15">
														</tui-icon> -->
													{{ item.agreeCount }}
												</view>
											</view>
											<view class="card-nums">
												<tui-icon name="eye" size="15" style="color: floralwhite;"></tui-icon>
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
</template>

<script>
	import {
		getFollow
	} from "@/api/follow.js"
	import {
		addBrowseRecord
	} from "@/api/browseRecord.js"
	export default {
		data() {
			return {
				currentTab: 1,
				T: true,
				C: -1,
				visiable: false,
				triggered: false,
				userInfo: {},
				page: 1,
				limit: 5,
				size: 10,
				total: 0,
				isEnd: false, //是否到底底部了
				loading: false, //是否正在加载
				keyword: '',
				categoryList: [],
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

		onPageScroll(e) {
			this.stickyScrollTop = e.stickyScrollTop
		},
		created() {
			this.getFollow()
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
			changeSticky(e) {
				console.log(e)
			},

			change(e) {
				this.currentTab = e.index
			},

			show() {
				this.T = !this.T
			},
			openDrawer() {
				this.visiable = true
			},
			closeDrawer() {
				this.visiable = false
			},

			scroll(e) {
				this.old.scrollTop = e.detail.scrollTop
				if (e.detail.scrollTop > 50) {
					this.isFixed = true
				} else {
					this.isFixed = false
				}
			},

			getMoreData(dataList) {
				dataList.forEach(item => {
					this.list.push(this.getItem(item))
				})
			},

			getItem(item) {
				return {
					id: item.nid,
					image: item.imgUrls[0],
					content: item.title,
					count: item.count,
					avatar: item.avatar,
					username: item.username,
					agreeCount: item.likeCount,
					isLike: item.isLike,
					viewCount: item.viewCount
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
				this.C = -1
				this.triggered = true;
				this.isEnd = false
				setTimeout(() => {
					this.triggered = false;
					this.clear()

					this.page = 1

					this.isSearchByCategory = false

					this.getFollow()
				}, 500)
			},
			// 清空数据
			clear() {
				//刷新数据之前要把dataList数据清空
				this.list = [];
				this.list1 = [];
				this.list2 = [];
				this.$refs.waterfall.clear();
			},
			getFollow() {
				getFollow(this.page, this.size).then(res => {
					if (res.data == null) {
						this.isFirst = true
						this.getPage()
					} else {
						this.total = res.data.total
						this.getMoreData(res.data.records)
					}
				})
			},

			changeList(e) {
				this[e.name].push(e.value);

			},
			loadData() {
				this.loading = true
				setTimeout(() => {
					if (this.isFirst) {
						if (this.list.length >= this.total) {
							this.isEnd = true
							this.loading = false;
							return
						}
					} else {
						if (this.total == 0) {
							this.isEnd = true
							this.loading = false;
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
							this.loading = false;
						})
					} else {
						let params = {
							uid: this.userInfo.id
						}
						getFollow(this.page, this.size, params).then(res => {
							if (res.data == null) {
								getPage(this.page, this.limit, params).then(res => {
									this.getMoreData(res.data.records)
									this.total = res.data.total
									this.loading = false;
									if (this.list.length >= this.total) {
										this.isEnd = true;
									}

								})
							} else {
								this.getMoreData(res.data.records)
								this.total = res.data.total
								this.loading = false;
								if (this.list.length >= this.total) {
									this.isEnd = true;
								}
							}
						})
					}
				}, 100)
			},
			getImgInfo(mid) {
				this.isFirst = false
				//添加一条浏览记录
				let data = {}
				data.uid = this.userInfo.id
				data.noteId = mid
				addBrowseRecord(data).then(res => {
					uni.navigateTo({
						url: "/pages/main/main?mid=" + mid
					})
				})
			},
		}
	}
</script>

<style scoped>
	@import url(./follow.css);
</style>