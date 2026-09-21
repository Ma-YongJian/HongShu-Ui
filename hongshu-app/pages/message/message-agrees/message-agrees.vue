<template>
	<view class="container">
		<hs-nav-bar title="赞和收藏"></hs-nav-bar>
		<scroll-view scroll-y class="page" @scrolltolower="loadData">
			<view class="list-item" v-for="(item, index) in dataList" :key="index">
				<image class="avatar" :src="item.avatar" mode="aspectFill" @click.stop="openUser(item.uid)"></image>
				<view class="content" @click="onItemTapAt(index)">
					<view class="username">{{ item.username }}</view>
					<view class="action-info">
						<text class="action-text">{{ item.actionText }}</text>
						<text class="type-tag">{{ item.typeTag }}</text>
						<text class="time">{{ item.time }}</text>
					</view>
					<view class="snippet" v-if="item.content">{{ item.content }}</view>
				</view>
				<image v-if="item.cover" class="cover" :src="item.cover" mode="aspectFill" @click.stop="onItemTapAt(index)"></image>
			</view>
			<hs-empty v-if="!loading && !dataList.length" title="暂无赞和收藏" tip="有人点赞或收藏后会显示在这里"></hs-empty>
			<view class="loadStyle" v-if="!isEnd && loading">正在加载中</view>
			<view class="loadStyle" v-if="isEnd && dataList.length">我也是有底线的~</view>
			<view class="list-footer"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { getAllAgreeAndCollection } from "@/api/agreeCollect.js"
	import { mediaUrl } from '@/utils/upload.js'
	import { openNote, openUser, noticeThumb, currentUid } from '@/utils/noteNav.js'
	import { timeAgo } from "@/utils/webUtils.js"
	export default {
		data() {
			return {
				dataList: [],
				page: 1,
				limit: 10,
				total: 0,
				isEnd: false,
				loading: false,
				uid: '',
			}
		},
		created() {
			this.uid = currentUid()
			this.getAllAgreeAndCollection()
		},
		methods: {
			openUser,
			actionTextOf(type) {
				const t = Number(type)
				if (t === 1) return '赞了你的'
				if (t === 2) return '赞了你的'
				if (t === 4) return '收藏了你的'
				if (t === 3) return '收藏了你的'
				return '互动了你的'
			},
			typeTagOf(type) {
				const t = Number(type)
				if (t === 2) return '评论'
				if (t === 4) return '专辑'
				return '笔记'
			},
			mapItem(e) {
				return {
					_key: (e.itemId || '') + '-' + (e.uid || '') + '-' + (e.time || '') + '-' + e.type,
					uid: e.uid,
					username: e.username,
					avatar: mediaUrl(e.avatar),
					cover: noticeThumb(e),
					itemId: e.itemId,
					aid: e.aid || (Number(e.type) === 4 ? e.itemId : ''),
					type: e.type,
					content: e.content || '',
					actionText: this.actionTextOf(e.type),
					typeTag: this.typeTagOf(e.type),
					time: timeAgo(e.time)
				}
			},
			pickRecords(res) {
				if (!res || res.data == null) return []
				if (Array.isArray(res.data)) return res.data
				return res.data.records || []
			},
			getAllAgreeAndCollection() {
				this.loading = true
				getAllAgreeAndCollection(this.page, this.limit, {
					uid: this.uid
				}).then(res => {
					const list = this.pickRecords(res)
					this.dataList = list.map(this.mapItem)
					this.total = (res.data && res.data.total) || this.dataList.length
					this.isEnd = list.length < this.limit
				}).catch(() => {
					this.dataList = []
					this.isEnd = true
				}).then(() => {
					this.loading = false
				})
			},
			onItemTap(item) {
				if (Number(item.type) === 4) {
					uni.navigateTo({
						url: "/pages/user/albums/albumInfo?albumId=" + (item.aid || item.itemId)
					})
					return
				}
				openNote(item.itemId)
			},
			onItemTapAt(index) {
				this.onItemTap(this.dataList[index])
			},
			loadData() {
				if (this.isEnd || this.loading) return
				this.loading = true
				this.page = this.page + 1
				getAllAgreeAndCollection(this.page, this.limit, {
					uid: this.uid
				}).then(res => {
					const list = this.pickRecords(res)
					this.dataList = this.dataList.concat(list.map(this.mapItem))
					if (!list.length || list.length < this.limit) this.isEnd = true
				}).catch(() => {
					this.isEnd = true
				}).then(() => {
					this.loading = false
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./message-agrees.css);
</style>
