<template>
	<view class="container">
		<hs-nav-bar title="评论和@"></hs-nav-bar>
		<scroll-view scroll-y class="page" @scrolltolower="loadData">
			<view class="list-item" v-for="(item, index) in dataList" :key="index">
				<image class="avatar" :src="item.avatar" mode="aspectFill" @click.stop="openUser(item.uid)"></image>
				<view class="content" @click="onItemTapAt(index)">
					<view class="username">{{ item.username }}</view>
					<view class="action-info">
						<text class="action-text">{{ item.actionText }}</text>
						<text class="type-tag">笔记</text>
						<text class="time">{{ item.time }}</text>
					</view>
					<view class="snippet" v-if="item.content">{{ item.content }}</view>
					<view class="reply" v-if="item.replyContent">
						{{ item.replyName ? item.replyName + '：' : '' }}{{ item.replyContent }}
					</view>
				</view>
				<image v-if="item.cover" class="cover" :src="item.cover" mode="aspectFill" @click.stop="onItemTapAt(index)"></image>
			</view>
			<hs-empty v-if="!loading && !dataList.length" title="暂无评论" tip="有人评论后会显示在这里"></hs-empty>
			<view class="loadStyle" v-if="!isEnd && loading">正在加载中</view>
			<view class="loadStyle" v-if="isEnd && dataList.length">我也是有底线的~</view>
			<view class="list-footer"></view>
		</scroll-view>
	</view>
</template>

<script>
	import { getAllReplyComment } from "@/api/comment.js"
	import { mediaUrl } from '@/utils/upload.js'
	import { openNote, openUser, noticeThumb, currentUid } from '@/utils/noteNav.js'
	import { timeAgo } from "@/utils/webUtils.js"
	export default {
		data() {
			return {
				page: 1,
				limit: 8,
				total: 0,
				isEnd: false,
				loading: false,
				dataList: [],
				uid: '',
			}
		},
		created() {
			this.uid = currentUid()
			this.getAllReplyComment()
		},
		methods: {
			openUser,
			pickRecords(res) {
				if (!res || res.data == null) return []
				if (Array.isArray(res.data)) return res.data
				return res.data.records || []
			},
			mapItem(e) {
				const isReply = e.replyId && String(e.replyId) !== '0'
				const toMe = String(e.replyUid) === String(this.uid)
				return {
					_key: e.id || ((e.nid || '') + '-' + (e.uid || '') + '-' + (e.time || '')),
					id: e.id,
					nid: e.nid,
					uid: e.uid,
					username: e.username,
					avatar: mediaUrl(e.avatar),
					cover: noticeThumb(e),
					content: e.content || '',
					replyContent: e.replyContent || '',
					replyName: toMe ? '' : (e.replyUsername || e.replyName || ''),
					actionText: isReply && toMe ? '回复了你的' : '评论了你的',
					time: timeAgo(e.time || e.createDate)
				}
			},
			getAllReplyComment() {
				this.loading = true
				getAllReplyComment(this.page, this.limit, {
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
				openNote(item.nid)
			},
			onItemTapAt(index) {
				this.onItemTap(this.dataList[index])
			},
			loadData() {
				if (this.isEnd || this.loading) return
				this.loading = true
				this.page = this.page + 1
				getAllReplyComment(this.page, this.limit, {
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
	@import url(./messgae-comments.css);
</style>
