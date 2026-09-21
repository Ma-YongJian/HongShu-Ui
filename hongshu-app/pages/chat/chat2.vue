<template>
	<view class="chat-page">
		<hs-nav-bar :isFixed="true">
			<template #center>
				<view class="nav-mid" @click="goUser(toUid)">
					<image class="nav-avatar" :src="peerAvatar" mode="aspectFill"></image>
					<view class="nav-name">{{ toUserInfo.username || '对话' }}</view>
				</view>
			</template>
			<template #right>
				<view class="hs-nav-action" @click="goUser(toUid)">
					<tui-icon name="more-fill" size="22" color="#111827"></tui-icon>
				</view>
			</template>
		</hs-nav-bar>

		<scroll-view class="chat-scroll" scroll-y :scroll-into-view="scrollInto" :scroll-with-animation="true"
			refresher-enabled="true" :refresher-triggered="triggered" @refresherrefresh="onRefresh" @tap="closeKeyboard">
			<view v-if="!dataList.length && loaded" class="empty-tip">还没有消息，打个招呼吧</view>
			<view v-for="(item, index) in dataList" :id="'msg-' + index" :key="item._key">
				<view v-if="item.showTime" class="time-tip">{{ item.time }}</view>
				<view class="msg-row" :class="{ mine: isMine(item) }">
					<image v-if="!isMine(item)" class="msg-avatar" :src="peerAvatar" mode="aspectFill"
						@click="goUser(toUid)"></image>
					<view class="bubble" :class="isMine(item) ? 'bubble-mine' : 'bubble-other'">
						<text class="bubble-text">{{ item.content }}</text>
					</view>
					<image v-if="isMine(item)" class="msg-avatar" :src="myAvatar" mode="aspectFill"
						@click="goUser(userInfo.id)"></image>
				</view>
			</view>
			<view id="msg-bottom" class="scroll-anchor"></view>
		</scroll-view>

		<view class="composer" :style="{ paddingBottom: composerPad }">
			<input class="composer-input" v-model="recordInput" confirm-type="send" :adjust-position="true"
				:cursor-spacing="16" maxlength="700" placeholder="发送消息" @confirm="send" />
			<view class="send-btn" :class="{ disabled: !canSend }" @click="send">发送</view>
		</view>
	</view>
</template>

<script>
	import { addChatRecord, getChatRecord } from "@/api/chat.js"
	import { getUserInfo } from '@/api/user.js'
	import { mediaUrl } from '@/utils/upload.js'
	import { subscribeIm, parseImPayload } from '@/utils/imSocket.js'
	import { timestampToDateTime } from "@/utils/webUtils.js"

	export default {
		data() {
			return {
				recordInput: "",
				scrollInto: '',
				userInfo: {},
				toUid: '',
				page: 1,
				limit: 20,
				total: 0,
				dataList: [],
				toUserInfo: {},
				triggered: false,
				loaded: false,
				sending: false,
				localSeq: 0,
				unsub: null,
				composerPad: 'env(safe-area-inset-bottom)',
				statusBarHeight: 0
			}
		},
		computed: {
			myAvatar() {
				return mediaUrl(this.userInfo.avatar)
			},
			peerAvatar() {
				return mediaUrl(this.toUserInfo.avatar)
			},
			canSend() {
				return !!(this.recordInput && this.recordInput.trim()) && !this.sending
			}
		},
		onLoad(option) {
			this.statusBarHeight = (uni.getSystemInfoSync() || {}).statusBarHeight || 0
			this.toUid = option.toUid || option.to || ''
			this.userInfo = uni.getStorageSync("userInfo") || {}
			this.getToUserInfo()
			this.getList(true)
		},
		onShow() {
			this.unsub = subscribeIm((data) => this.acceptMessage(data))
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
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			closeKeyboard() {
				uni.hideKeyboard()
			},
			goUser(uid) {
				if (!uid) return
				uni.navigateTo({
					url: "/pages/otherUser/otherUser?uid=" + uid
				})
			},
			isMine(item) {
				return String(item.sendUid) === String(this.userInfo.id)
			},
			shouldShowTime(list, index) {
				if (index === 0) return true
				const prev = Number(list[index - 1].timestamp) || 0
				const cur = Number(list[index].timestamp) || 0
				return !prev || cur - prev > 5 * 60 * 1000
			},
			nextLocalKey() {
				this.localSeq += 1
				return 'local-' + Date.now() + '-' + this.localSeq
			},
			msgKey(item) {
				if (item && item._key) return item._key
				if (item && item.id != null && item.id !== '') return 'id-' + item.id
				return this.nextLocalKey()
			},
			isDupMsg(a, b) {
				if (!a || !b) return false
				if (a.id != null && a.id !== '' && b.id != null && b.id !== '' && String(a.id) === String(b.id)) {
					return true
				}
				return String(a.sendUid) === String(b.sendUid) &&
					String(a.content) === String(b.content) &&
					Math.abs((Number(a.timestamp) || 0) - (Number(b.timestamp) || 0)) < 8000
			},
			uniqMessages(list) {
				const seenId = {}
				const out = []
				;(list || []).forEach((item) => {
					if (!item) return
					if (item.id != null && item.id !== '') {
						const idKey = String(item.id)
						if (seenId[idKey]) return
						seenId[idKey] = true
					} else {
						const last = out[out.length - 1]
						if (last && this.isDupMsg(last, item)) return
					}
					out.push(item)
				})
				return out
			},
			decorate(list) {
				return this.uniqMessages(list).map((item, index, arr) => {
					const row = Object.assign({}, item)
					row.time = timestampToDateTime(row.timestamp)
					row.showTime = this.shouldShowTime(arr, index)
					row._key = this.msgKey(row)
					return row
				})
			},
			pushMsg(payload) {
				const last = this.dataList[this.dataList.length - 1]
				if (last && this.isDupMsg(last, payload)) return
				const row = Object.assign({
					timestamp: Date.now()
				}, payload)
				row.time = timestampToDateTime(row.timestamp)
				row.showTime = this.shouldShowTime(this.dataList.concat([row]), this.dataList.length)
				row._key = this.msgKey(row)
				this.dataList.push(row)
				this.scrollToBottom()
			},
			scrollToBottom() {
				this.scrollInto = ''
				this.$nextTick(() => {
					this.scrollInto = 'msg-bottom'
				})
			},
			getToUserInfo() {
				if (!this.toUid) return
				getUserInfo({
					userId: this.toUid
				}).then((res) => {
					if (res.code === 200) {
						this.toUserInfo = res.data || {}
					}
				})
			},
			send() {
				const text = (this.recordInput || '').trim()
				if (!text) {
					uni.showToast({
						title: "内容不能为空~",
						icon: 'none'
					})
					return
				}
				if (this.sending) return
				this.sending = true
				addChatRecord({
					sendUid: String(this.userInfo.id),
					acceptUid: String(this.toUid),
					msgType: 1,
					chatType: 0,
					content: text
				}).then((res) => {
					if (res.code !== 200) {
						uni.showToast({
							title: res.message || '发送失败',
							icon: 'none'
						})
						return
					}
					const saved = (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) ? res.data : {}
					this.pushMsg({
						id: saved.id,
						sendUid: this.userInfo.id,
						acceptUid: this.toUid,
						content: text,
						timestamp: saved.timestamp || Date.now()
					})
					this.recordInput = ''
				}).catch(() => {
					uni.showToast({
						title: '发送失败',
						icon: 'none'
					})
				}).then(() => {
					this.sending = false
				})
			},
			getList(reset) {
				if (reset) {
					this.page = 1
					this.dataList = []
				}
				getChatRecord(this.page, this.limit, {
					acceptUid: this.toUid
				}).then((res) => {
					this.loaded = true
					if (res.code !== 200 || !res.data) return
					const records = (res.data.records || []).slice().reverse()
					this.total = res.data.total || 0
					if (reset) {
						this.dataList = this.decorate(records)
					} else {
						this.dataList = this.decorate(records.concat(this.dataList))
					}
					if (reset) this.scrollToBottom()
				}).catch(() => {
					this.loaded = true
				})
			},
			onRefresh() {
				this.triggered = true
				if (this.dataList.length >= this.total && this.total > 0) {
					setTimeout(() => {
						this.triggered = false
					}, 300)
					return
				}
				this.page += 1
				getChatRecord(this.page, this.limit, {
					acceptUid: this.toUid
				}).then((res) => {
					const records = (res.data && res.data.records || []).slice().reverse()
					this.dataList = this.decorate(records.concat(this.dataList))
				}).then(() => {
					this.triggered = false
				})
			},
			acceptMessage(raw) {
				const msg = parseImPayload(raw)
				if (!msg) return
				if (Array.isArray(msg) || Array.isArray(msg.content) || msg.msgType === 5 || msg.msgType === '5') {
					return
				}
				const sendUid = String(msg.sendUid || '')
				const acceptUid = String(msg.acceptUid || '')
				const me = String(this.userInfo.id)
				const peer = String(this.toUid)
				if (sendUid !== peer || acceptUid !== me) return
				const content = typeof msg.content === 'string' ? msg.content : String(msg.content || '')
				if (!content || content === '[object Object]') return
				this.pushMsg({
					id: msg.id,
					sendUid,
					acceptUid,
					content,
					timestamp: msg.timestamp || Date.now()
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./chat.css);
</style>
