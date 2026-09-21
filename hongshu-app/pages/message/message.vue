<template>
	<view class="message-page">
		<hs-nav-bar title="消息" :showBack="false"></hs-nav-bar>

		<view v-if="isGuest" class="guest-box" @click="goLogin">
			<view class="guest-title">登录后查看消息</view>
			<view class="guest-btn">去登录</view>
		</view>

		<scroll-view v-else scroll-y class="page" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh">
			<view class="msg-top-bar">
				<view class="msg-item" @click="next(1)">
					<view class="icon-wrap">
						<view class="icon-bg" style="background: #feebec;">
							<tui-icon name="like" color="#f43f5e" size="28"></tui-icon>
						</view>
						<view class="badge-corner" v-if="record.agreeCollectionCount > 0">
							{{ badgeText(record.agreeCollectionCount) }}
						</view>
					</view>
					<text class="msg-label">赞和收藏</text>
				</view>
				<view class="msg-item" @click="next(2)">
					<view class="icon-wrap">
						<view class="icon-bg" style="background: #e7f0ff;">
							<tui-icon name="people" color="#3d8af5" size="28"></tui-icon>
						</view>
						<view class="badge-corner" v-if="record.addFollowCount > 0">
							{{ badgeText(record.addFollowCount) }}
						</view>
					</view>
					<text class="msg-label">新增关注</text>
				</view>
				<view class="msg-item" @click="next(3)">
					<view class="icon-wrap">
						<view class="icon-bg" style="background: #e6fbf3;">
							<tui-icon name="message" color="#10b981" size="28"></tui-icon>
						</view>
						<view class="badge-corner" v-if="record.noreplyCount > 0">
							{{ badgeText(record.noreplyCount) }}
						</view>
					</view>
					<text class="msg-label">评论和@</text>
				</view>
			</view>

			<view class="session-list">
				<view v-if="!dataList.length" class="empty-tip">暂无会话</view>
				<tui-swipe-action v-for="(item, index) in dataList" :key="index" :actions="actions"
					@click="onSwipeDelete(index)">
					<template v-slot:content>
						<view class="session-row" @click="onOpenChat(index)">
							<image class="session-avatar" :src="avatarOf(item.avatar)" mode="aspectFill"
								:lazy-load="true"></image>
							<view class="session-mid">
								<view class="session-line">
									<view class="session-name">{{ item.username || '用户' }}</view>
									<view class="session-time">{{ item.time }}</view>
								</view>
								<view class="session-line">
									<view class="session-preview">{{ item.content || '暂无消息' }}</view>
									<view class="session-badge" v-if="item.count > 0">{{ badgeText(item.count) }}</view>
								</view>
							</view>
						</view>
					</template>
				</tui-swipe-action>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		getChatUserList,
		updateRecordCount,
		deleteRecord
	} from '@/api/chat.js'
	import {
		getUserRecord,
		clearUserRecord
	} from "@/api/user.js"
	import { mediaUrl } from '@/utils/upload.js'
	import { subscribeIm, parseImPayload } from '@/utils/imSocket.js'
	import { timeAgo } from "@/utils/webUtils.js"
	import { messageTabIndex } from '@/utils/tabbar.js'

	export default {
		data() {
			return {
				dataList: [],
				actions: [{
					name: '删除',
					color: '#fff',
					fontsize: 30,
					width: 70,
					background: '#FD3B31',
				}],
				record: {
					agreeCollectionCount: 0,
					addFollowCount: 0,
					noreplyCount: 0,
				},
				messageCount: 0,
				triggered: false,
				unsub: null
			}
		},
		computed: {
			isGuest() {
				const user = uni.getStorageSync("userInfo") || {}
				return !user.id
			}
		},
		watch: {
			record: {
				handler() {
					this.refreshTabDot()
				},
				deep: true
			},
			messageCount() {
				this.refreshTabDot()
			}
		},
		onShow() {
			if (this.isGuest) {
				this.dataList = []
				return
			}
			this.unsub = subscribeIm((data) => this.acceptMessage(data))
			this.getChatUserList()
			this.getUserRecord()
		},
		onHide() {
			if (this.unsub) {
				this.unsub()
				this.unsub = null
			}
		},
		onUnload() {
			if (this.unsub) {
				this.unsub()
				this.unsub = null
			}
		},
		methods: {
			avatarOf(path) {
				return mediaUrl(path)
			},
			badgeText(num) {
				const n = Number(num) || 0
				return n > 99 ? '99+' : n
			},
			goLogin() {
				uni.navigateTo({
					url: '/pages/login/login'
				})
			},
			refreshTabDot() {
				const hasDot = this.record.agreeCollectionCount > 0 || this.record.addFollowCount > 0 || this.record
					.noreplyCount > 0 || this.messageCount > 0
				if (hasDot) {
					uni.showTabBarRedDot({
						index: messageTabIndex()
					})
				} else {
					uni.hideTabBarRedDot({
						index: messageTabIndex()
					})
				}
			},
			onRefresh() {
				this.triggered = true
				this.getUserRecord()
				this.getChatUserList()
				setTimeout(() => {
					this.triggered = false
				}, 400)
			},
			next(index) {
				const pages = {
					1: "/pages/message/message-agrees/message-agrees",
					2: "/pages/message/message-followers/message-followers",
					3: "/pages/message/message-comments/message-comments"
				}
				uni.navigateTo({
					url: pages[index]
				})
				const user = uni.getStorageSync("userInfo") || {}
				clearUserRecord({
					uid: user.id,
					type: index
				}).then(() => {
					this.getUserRecord()
				})
			},
			handleAction(e, index) {
				const uid = (e && (e.uid || e.sendUid || e.sendId)) || (this.dataList[index] && this.dataList[index].uid)
				deleteRecord({
					sendUid: uid
				}).then(() => {
					const row = this.dataList[index]
					this.messageCount = Math.max(0, this.messageCount - ((row && row.count) || 0))
					this.dataList.splice(index, 1)
				})
			},
			onSwipeDelete(index) {
				this.handleAction(this.dataList[index], index)
			},
			onOpenChat(index) {
				this.chat(this.dataList[index], index)
			},
			setSessionList(list) {
				const rows = (list || []).map((item) => {
					item.time = timeAgo(item.timestamp)
					return item
				})
				this.dataList = rows
				let count = 0
				rows.forEach((item) => {
					if (item.count > 0) count += item.count
				})
				this.messageCount = count
			},
			applyNotice(data) {
				this.record = {
					agreeCollectionCount: data.agreeCollectionCount || data.likeOrCollectionCount || 0,
					addFollowCount: data.addFollowCount || data.followCount || 0,
					noreplyCount: data.noreplyCount || data.commentCount || 0
				}
			},
			getChatUserList() {
				getChatUserList().then((res) => {
					if (res.code === 200) {
						this.setSessionList(res.data || [])
					}
				})
			},
			getUserRecord() {
				getUserRecord().then((res) => {
					if (res.code === 200 && res.data) {
						this.applyNotice(res.data)
					}
				})
			},
			chat(item, index) {
				const fromUid = item.uid || item.sendUid
				updateRecordCount({
					sendUid: fromUid
				}).then(() => {
					this.messageCount = Math.max(0, this.messageCount - (this.dataList[index].count || 0))
					this.dataList[index].count = 0
					uni.navigateTo({
						url: "/pages/chat/chat2?toUid=" + fromUid
					})
				}).catch(() => {
					uni.navigateTo({
						url: "/pages/chat/chat2?toUid=" + fromUid
					})
				})
			},
			acceptMessage(raw) {
				const message = parseImPayload(raw)
				if (!message) return
				if (Array.isArray(message)) {
					this.setSessionList(message)
					return
				}
				if (Array.isArray(message.content) && (message.msgType === 5 || message.msgType === '5')) {
					this.setSessionList(message.content)
					return
				}
				if (message.likeOrCollectionCount != null || message.followCount != null || message.agreeCollectionCount != null) {
					this.applyNotice(message)
					return
				}
				if (message.content && typeof message.content === 'object' && !Array.isArray(message.content) &&
					(message.content.likeOrCollectionCount != null || message.content.followCount != null)) {
					this.applyNotice(message.content)
					return
				}
				this.getChatUserList()
			}
		}
	}
</script>

<style scoped>
	@import url(./message.css);
</style>
