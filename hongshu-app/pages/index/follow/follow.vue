<template>
	<view class="container">
		<scroll-view scroll-y class="page" @scrolltolower="loadData" refresher-enabled="true"
			:refresher-triggered="triggered" @refresherrefresh="onRefresh" @scroll="scroll" :scroll-top="scrollTop">
			<view class="main">
				<uv-waterfall ref="waterfall" v-model="list" column-count="2" :add-time="0" @changeList="changeList" column-gap="8">
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
				<hs-empty v-if="!loading && !list.length" title="还没有关注动态"
					:tip="hasLogin ? '去发现更多有趣的人吧' : '登录后查看关注的人更新'"
					:action="hasLogin ? '去发现' : '去登录'" @action="onEmptyAction"></hs-empty>
			</view>
			<view class="loadStyle" v-if="!isEnd && loading">
				<tui-icon name="loading" :size="18"></tui-icon>
			</view>
			<view class="loadStyle" v-if="isEnd && list.length">我也是有底线的~</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		getFollow
	} from "@/api/follow.js"
	import {
		mediaUrl
	} from '@/utils/upload.js'
	import {
		openNote,
		openUser,
		currentUid,
		ensureLogin,
		noteDeletedMixin
	} from '@/utils/noteNav.js'
	import { tokenUtil } from '@/utils/token.js'
	export default {
		mixins: [noteDeletedMixin],
		data() {
			return {
				triggered: false,
				userInfo: {},
				page: 1,
				limit: 10,
				size: 10,
				total: 0,
				isEnd: false,
				loading: false,
				scrollTop: 0,
				old: {
					scrollTop: 0
				},
				list: [],
				list1: [],
				list2: []
			}
		},
		computed: {
			hasLogin() {
				return !!(tokenUtil.get() && currentUid())
			}
		},

		created() {
			this.userInfo = uni.getStorageSync('userInfo') || {}
			this.getFollow()
		},
		methods: {
			scroll(e) {
				this.old.scrollTop = e.detail.scrollTop
			},
			getMoreData(dataList) {
				const records = dataList || []
				if (!records.length) {
					if (this.page <= 1) this.isEnd = true
					return
				}
				this.list = this.list.concat(records.map(item => this.getItem(item)))
			},
			getItem(item) {
				return {
					id: item.nid || item.id,
					uid: item.uid,
					noteCover: mediaUrl((item.imgUrls && item.imgUrls[0]) || item.noteCover),
					image: mediaUrl((item.imgUrls && item.imgUrls[0]) || item.noteCover),
					title: item.title || item.content,
					content: item.title || item.content,
					avatar: mediaUrl(item.avatar),
					username: item.username,
					agreeCount: item.likeCount,
					isLike: item.isLike,
					noteCoverHeight: item.noteCoverHeight || item.height
				}
			},
			onRefresh() {
				this.triggered = true
				this.isEnd = false
				setTimeout(() => {
					this.triggered = false
					this.clear()
					this.page = 1
					this.getFollow()
				}, 300)
			},
			clear() {
				this.list = []
				this.list1 = []
				this.list2 = []
				if (this.$refs.waterfall) this.$refs.waterfall.clear()
			},
			getFollow() {
				if (!this.hasLogin) {
					this.loading = false
					return
				}
				this.loading = true
				this.userInfo = uni.getStorageSync('userInfo') || {}
				getFollow(this.page, this.size).then(res => {
					this.loading = false
					const page = res.data || {}
					this.total = page.total || 0
					this.getMoreData(page.records || [])
					if (!this.list.length || this.list.length >= this.total) this.isEnd = true
				}).catch(() => {
					this.loading = false
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
				if (this.isEnd || this.loading) return
				this.page = this.page + 1
				this.getFollow()
			},
			getImgInfo(item) {
				openNote(item)
			},
			goCardUser(item) {
				openUser(item && item.uid)
			},
			onEmptyAction() {
				if (this.hasLogin) {
					this.$parent && this.$parent.change && this.$parent.change({ index: 1 })
					return
				}
				ensureLogin()
			}
		}
	}
</script>

<style scoped>
	@import url(./follow.css);
</style>