<template>
	<view class="container">
		<scroll-view scroll-y class="page" @scrolltolower="loadMore" refresher-enabled="true"
			:refresher-triggered="triggered" @refresherrefresh="onRefresh">
			<view class="item-hot" v-for="(item, index) in dataList" :key="index">
				<view class="item-hot-left" :class="index < 3 ? 'rank-' + (index + 1) : 'rank-n'">{{ index + 1 }}</view>
				<view class="item-hot-right">
					<view class="item-hot-top">
						<view class="top-left" @click="onTapUser(index)">
							<view class="avatar">
								<image :src="item.avatar" mode="aspectFill" :lazy-load="true" />
							</view>
							<view class="username">{{ item.username }}</view>
						</view>
						<view class="top-right">
							<tui-icon name="like-fill" :size="14" color="#ff2442"></tui-icon>
							{{ item.likeCount || 0 }}
						</view>
					</view>
					<view class="content" @click="onTapNote(index)">{{ item.title }}</view>
					<view class="images" @click="onTapNote(index)">
						<view v-for="(img, imgIndex) in item.previewImgs" :key="imgIndex">
							<image :src="img" mode="aspectFill" :lazy-load="true" class="fadeImg" />
						</view>
						<view class="nums" v-if="item.moreImgCount">+{{ item.moreImgCount }}</view>
					</view>
				</view>
			</view>
			<hs-empty v-if="!loading && !dataList.length" title="暂无热榜内容" tip="去发现页看看最新笔记吧"></hs-empty>
			<view class="loadStyle" v-if="loading">加载中...</view>
			<view class="loadStyle" v-if="isEnd && dataList.length">我也是有底线的~</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		getHot
	} from "@/api/imgDetail.js";
	import {
		mapNoteMedia
	} from '@/utils/upload.js'
	import {
		openNote,
		openUser,
		noteDeletedMixin
	} from '@/utils/noteNav.js'

	export default {
		mixins: [noteDeletedMixin],
		data() {
			return {
				page: 1,
				limit: 20,
				total: 0,
				dataList: [],
				isEnd: false,
				loading: false,
				triggered: false
			};
		},
		created() {
			this.loadData();
		},
		methods: {
			loadData() {
				this.loading = true
				getHot(this.page, this.limit).then((res) => {
					const page = res.data || {}
					const records = (page.records || []).map(item => {
						const row = mapNoteMedia(Object.assign({}, item))
						const imgs = Array.isArray(row.imgsUrl) ? row.imgsUrl : []
						row.previewImgs = imgs.slice(0, 3)
						row.moreImgCount = imgs.length > 3 ? imgs.length - 3 : 0
						return row
					})
					this.total = page.total || records.length
					this.dataList = this.page === 1 ? records : this.dataList.concat(records)
					this.isEnd = !records.length || this.dataList.length >= this.total
					this.loading = false
				}).catch(() => {
					this.loading = false
				});
			},
			loadMore() {
				if (this.isEnd || this.loading) return
				this.page += 1
				this.loadData()
			},
			onRefresh() {
				this.triggered = true
				this.page = 1
				this.isEnd = false
				this.loadData()
				setTimeout(() => {
					this.triggered = false
				}, 400)
			},
			onTapUser(index) {
				const item = this.dataList[index]
				if (item) openUser(item.uid)
			},
			onTapNote(index) {
				const item = this.dataList[index]
				if (item) openNote(item)
			}
		}
	};
</script>

<style scoped>
	@import url("./hot.css");
</style>
