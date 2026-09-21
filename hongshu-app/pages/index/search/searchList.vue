<template>
	<view class="container">
		<hs-nav-bar>
			<template #center>
				<view class="tui-search-box">
					<tui-icon name="search-2" :size="18" color="#bfbfbf"></tui-icon>
					<input class="tui-search-text" placeholder="请输入搜索内容" v-model="keyword" confirm-type="search"
						@confirm="search()" />
				</view>
			</template>
			<template #right>
				<view class="search-action" @click="search()">搜索</view>
			</template>
		</hs-nav-bar>

		<view class="search-tabs">
			<view class="search-tab" :class="{ active: nav === 0 }" @click="selectNav(0)">笔记</view>
			<view class="search-tab" :class="{ active: nav === 1 }" @click="selectNav(1)">用户</view>
			<view class="search-sort" v-if="nav === 0" @click="toggleSortMenu">
				{{ sortLabel }}
				<tui-icon :name="showMenu ? 'arrowup' : 'arrowdown'" :size="14"></tui-icon>
			</view>
		</view>
		<view class="sort-menu" v-if="showMenu">
			<view :class="{ active: activate === 0 }" @click="esSearch(0)">综合</view>
			<view :class="{ active: activate === 1 }" @click="esSearch(1)">最热</view>
			<view :class="{ active: activate === 2 }" @click="esSearch(2)">最新</view>
		</view>

		<scroll-view scroll-y class="page" @scrolltolower="loadData">
			<view class="main" v-if="nav == 0">
				<uv-waterfall ref="waterfall" v-model="dataList" column-count="2" :add-time="0" @changeList="changeList"
					column-gap="8">
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
				<hs-empty v-if="!loading && !dataList.length" title="没有找到相关笔记" tip="换个关键词试试"></hs-empty>
			</view>

			<view v-if="nav==1">
				<view class="tui-item-box" v-for="(item, index) in userList" :key="index">
					<view class="tui-msg-box" @click="getUserInfo(item.id)">
						<image :src="mediaUrl(item.avatar)" class="tui-msg-pic" mode="aspectFill"></image>
						<view class="tui-msg-item">
							<view class="tui-msg-name">{{ item.username }}</view>
							<view class="tui-msg-type">
								<p>来因号：{{ item.hsId || '-' }}</p>
								<p>粉丝：{{ item.fanCount || 0 }}</p>
							</view>
						</view>
					</view>
					<view class="tui-msg-right" v-if="currentUid() != item.id">
						<tui-button v-if="!item.isFollow && !item.isfollow" @click="follow(item.id, index)"
							height="56rpx" width="120rpx" type="primary" :size="22" shape="circle">关注</tui-button>
						<tui-button v-else @click="clearFollow(item.id, index)" height="56rpx" width="120rpx"
							type="gray" :size="22" shape="circle">已关注</tui-button>
					</view>
				</view>
				<hs-empty v-if="!loading && !userList.length" title="没有找到相关用户"></hs-empty>
			</view>

			<view class="loadStyle" v-if="!isEnd && loading">
				<tui-icon name="loading" :size="18"></tui-icon>
			</view>
			<view class="loadStyle" v-if="isEnd && (dataList.length || userList.length)">我也是有底线的~</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		esSearch
	} from '@/api/search.js'
	import {
		searchUser
	} from '@/api/user.js'
	import {
		mapNoteMedia,
		mediaUrl
	} from '@/utils/upload.js'
	import {
		clearFollow,
		followUser
	} from '@/api/follow.js'
	import {
		openNote,
		openUser,
		currentUid,
		toNoteCard,
		noteDeletedMixin
	} from '@/utils/noteNav.js'
	export default {
		mixins: [noteDeletedMixin],
		data() {
			return {
				userInfo: {},
				page: 1,
				limit: 10,
				total: 0,
				dataList: [],
				list1: [],
				list2: [],
				isEnd: false,
				loading: false,
				keyword: '',
				type: 0,
				nav: 0,
				showMenu: false,
				activate: 0,
				userList: []
			}
		},
		computed: {
			sortLabel() {
				return ['综合', '最热', '最新'][this.activate] || '综合'
			}
		},
		created() {
			this.userInfo = uni.getStorageSync("userInfo") || {}
		},
		onLoad(options) {
			this.keyword = decodeURIComponent(options.keyword || '')
			this.esSearch(0)
		},
		methods: {
			mediaUrl,
			currentUid,
			changeList(e) {
				this[e.name].push(e.value)
			},
			selectNav(index) {
				this.nav = index
				this.showMenu = false
				this.page = 1
				this.isEnd = false
				if (index === 0) this.esSearch(this.activate)
				else this.searchUser()
			},
			toggleSortMenu() {
				this.showMenu = !this.showMenu
			},
			loadData() {
				if (this.isEnd || this.loading) return
				if (this.nav === 0 && this.dataList.length >= this.total) {
					this.isEnd = true
					return
				}
				if (this.nav === 1 && this.userList.length >= this.total) {
					this.isEnd = true
					return
				}
				this.page += 1
				this.loading = true
				if (this.nav === 0) {
					esSearch(this.page, this.limit, {
						keyword: this.keyword,
						type: this.type
					}).then(res => {
						const records = (res.data && res.data.records) || []
						this.dataList = this.dataList.concat(records.map(item => toNoteCard(mapNoteMedia(item))))
						this.loading = false
						if (!records.length) this.isEnd = true
					}).catch(() => {
						this.loading = false
					})
				} else {
					searchUser(this.page, this.limit, {
						keyword: this.keyword,
						uid: currentUid()
					}).then(res => {
						const records = (res.data && res.data.records) || []
						this.userList = this.userList.concat(records)
						this.loading = false
						if (!records.length) this.isEnd = true
					}).catch(() => {
						this.loading = false
					})
				}
			},
			getImgInfo(item) {
				openNote(item)
			},
			goCardUser(item) {
				openUser(item && item.uid)
			},
			search() {
				if (this.nav === 0) this.esSearch(this.activate)
				else this.searchUser()
			},
			esSearch(type) {
				this.activate = type
				this.type = type
				this.showMenu = false
				this.dataList = []
				this.list1 = []
				this.list2 = []
				if (this.$refs.waterfall) this.$refs.waterfall.clear()
				this.page = 1
				this.loading = true
				esSearch(this.page, this.limit, {
					keyword: this.keyword,
					type
				}).then(res => {
					const page = res.data || {}
					this.dataList = (page.records || []).map(item => toNoteCard(mapNoteMedia(item)))
					this.total = page.total || 0
					this.isEnd = !this.dataList.length || this.dataList.length >= this.total
					this.loading = false
				}).catch(() => {
					this.loading = false
				})
			},
			searchUser() {
				this.page = 1
				this.loading = true
				searchUser(this.page, this.limit, {
					keyword: this.keyword,
					uid: currentUid()
				}).then(res => {
					const page = res.data || {}
					this.userList = page.records || []
					this.total = page.total || 0
					this.isEnd = !this.userList.length || this.userList.length >= this.total
					this.loading = false
				}).catch(() => {
					this.loading = false
					this.userList = []
				})
			},
			getUserInfo(uid) {
				openUser(uid)
			},
			follow(fid, index) {
				followUser({
					followerId: fid
				}).then(() => {
					this.$set(this.userList[index], 'isFollow', true)
					this.$set(this.userList[index], 'isfollow', true)
				})
			},
			clearFollow(fid, index) {
				clearFollow({
					followerId: fid
				}).then(() => {
					this.$set(this.userList[index], 'isFollow', false)
					this.$set(this.userList[index], 'isfollow', false)
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./searchList.css);
</style>
