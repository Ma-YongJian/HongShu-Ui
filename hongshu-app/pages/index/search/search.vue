<template>
	<view class="search-page">
		<hs-nav-bar :hasRightSlot="true" :border="false">
			<template #center>
				<view class="search-box">
					<tui-icon name="search-2" :size="18" color="#8a8a8a"></tui-icon>
					<input class="search-input" placeholder="搜索笔记、用户" placeholder-class="search-ph"
						v-model="keyword" :focus="true" confirm-type="search" maxlength="40"
						@input="onInput" @confirm="search" @focus="onFocus" />
				</view>
			</template>
			<template #right>
				<view class="search-action" @click="onNavAction">{{ navActionText }}</view>
			</template>
		</hs-nav-bar>

		<view class="suggest-wrap" v-if="showSuggest">
			<view class="user-row" v-for="(user, index) in userList" :key="index" @click="onTapUser(index)">
				<image class="user-avatar" :src="mediaUrl(user.avatar)" mode="aspectFill"></image>
				<view class="user-meta">
					<view class="user-name">{{ user.username }}</view>
					<view class="user-sub">来因号 {{ user.hsId || user.userId || '-' }} · 粉丝 {{ user.fanCount || 0 }}</view>
				</view>
			</view>
			<view class="suggest-row" v-for="(item, index) in searchData" :key="index" @click="onTapSuggest(index)">
				<tui-icon name="search-2" :size="16" color="#c0c4cc"></tui-icon>
				<text class="suggest-text">{{ item.keyword || item.content }}</text>
			</view>
		</view>

		<view v-else class="search-body">
			<view class="search-card" v-if="showHistory">
				<view class="section-header">
					<text class="section-title">最近搜索</text>
					<view class="header-actions" v-if="dataList.length">
						<text class="header-link" @click="toggleManage">{{ startDelete ? '完成' : '管理' }}</text>
						<text class="header-link header-danger" v-if="startDelete" @click="allDel">清空</text>
					</view>
				</view>
				<view class="history-list" v-if="dataList.length">
					<view class="history-tag" :class="{ managing: startDelete }"
						v-for="(item, index) in dataList" :key="index" @click="onHistoryTap(index)">
						<text class="tag-text">{{ item.content || item.keyword }}</text>
						<text v-if="startDelete" class="tag-close">×</text>
					</view>
				</view>
				<view v-else class="empty-text">暂无搜索记录</view>
			</view>

			<view class="search-card" v-if="hotSearchList.length">
				<view class="hot-header">
					<text class="hot-flame">🔥</text>
					<text class="section-title">热门搜索</text>
				</view>
				<view class="hot-list">
					<view class="hot-row" v-for="(item, index) in hotSearchList" :key="index"
						@click="onTapHot(index)">
						<text class="hot-rank" :class="'rank-' + (index < 3 ? index + 1 : 'n')">{{ index + 1 }}</text>
						<text class="hot-keyword">{{ item }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getAllSearchRecord, addSearchRecord, deleteSearchRecord } from '@/api/searchRecord.js'
	import { addSearchRecordData, esSearchRecord, esAllSearchRecord } from '@/api/search.js'
	import { getAllTag } from '@/api/tag.js'
	import { searchUserByUsername } from '@/api/user.js'
	import { mediaUrl } from '@/utils/upload.js'
	import { currentUid, openUser } from '@/utils/noteNav.js'

	function uniqueTexts(list) {
		const out = []
		const seen = {}
		;(list || []).forEach(text => {
			const key = String(text || '').trim()
			if (!key || seen[key]) return
			seen[key] = true
			out.push(key)
		})
		return out
	}

	export default {
		data() {
			return {
				keyword: '',
				dataList: [],
				startDelete: false,
				searchData: [],
				hotSearchList: [],
				userList: []
			}
		},
		computed: {
			showHistory() {
				return !!(currentUid() || (this.dataList && this.dataList.length))
			},
			showSuggest() {
				return !!(this.keyword && String(this.keyword).trim())
			},
			navActionText() {
				return this.showSuggest ? '搜索' : '取消'
			}
		},
		onShow() {
			this.getAllSearchRecord()
			this.loadHot()
		},
		methods: {
			mediaUrl,
			onFocus() {
				this.startDelete = false
			},
			onInput() {
				this.startDelete = false
				const word = String(this.keyword || '').trim()
				if (!word) {
					this.userList = []
					this.searchData = []
					return
				}
				const params = { keyword: word }
				searchUserByUsername(params).then(res => {
					this.userList = res.data || []
				}).catch(() => {
					this.userList = []
				})
				esAllSearchRecord(params).then(res => {
					this.searchData = res.data || []
				}).catch(() => {
					this.searchData = []
				})
			},
			onNavAction() {
				if (!this.showSuggest) {
					uni.navigateBack({
						fail: () => {
							uni.switchTab({ url: '/pages/index/index' })
						}
					})
					return
				}
				this.search()
			},
			onTapUser(index) {
				const user = this.userList[index]
				if (user) openUser(user.id)
			},
			onTapSuggest(index) {
				const item = this.searchData[index]
				if (!item) return
				this.keyword = item.keyword || item.content || ''
				this.search()
			},
			onTapHot(index) {
				const word = this.hotSearchList[index]
				if (!word) return
				this.keyword = word
				this.search()
			},
			onHistoryTap(index) {
				const item = this.dataList[index]
				if (!item) return
				const word = item.content || item.keyword
				if (this.startDelete) {
					this.deleteOne(word, index)
					return
				}
				this.keyword = word
				this.search()
			},
			toggleManage() {
				this.startDelete = !this.startDelete
			},
			getAllSearchRecord() {
				const uid = currentUid()
				if (!uid) {
					this.dataList = []
					return
				}
				getAllSearchRecord({ uid }).then(res => {
					const list = res.data || []
					const unique = []
					const seen = {}
					list.forEach(item => {
						const key = item.content || item.keyword
						if (!key || seen[key]) return
						seen[key] = true
						unique.push(item)
					})
					this.dataList = unique
				}).catch(() => {
					this.dataList = []
				})
			},
			search() {
				const word = String(this.keyword || '').replace(/[\n\r\s]+/g, '')
				if (!word) {
					uni.showToast({ title: '请输入搜索内容', icon: 'none' })
					return
				}
				this.keyword = word
				this.addSearchRecord()
				const params = {
					uid: currentUid(),
					keyword: word
				}
				const go = () => {
					uni.navigateTo({
						url: '/pages/index/search/searchList?keyword=' + encodeURIComponent(word)
					})
				}
				addSearchRecordData(params).then(go).catch(go)
			},
			addSearchRecord() {
				const uid = currentUid()
				if (!uid) return
				addSearchRecord({
					uid,
					keyword: this.keyword
				})
			},
			deleteOne(word, index) {
				const uid = currentUid()
				this.dataList.splice(index, 1)
				if (!uid || !word) return
				deleteSearchRecord({
					uid,
					keyword: word
				}).catch(() => {
					this.getAllSearchRecord()
				})
			},
			allDel() {
				const uid = currentUid()
				uni.showModal({
					title: '清空搜索记录',
					content: '确定清空全部搜索记录吗？',
					confirmText: '清空',
					success: (res) => {
						if (!res.confirm) return
						this.dataList = []
						this.startDelete = false
						if (!uid) return
						deleteSearchRecord({ uid }).catch(() => {
							this.getAllSearchRecord()
						})
					}
				})
			},
			loadHot() {
				esSearchRecord().then(res => {
					const list = uniqueTexts((res.data || []).map(item => item.content || item.keyword))
					if (list.length) {
						this.hotSearchList = list.slice(0, 10)
						return
					}
					return getAllTag(1, 10, { keyword: '' }).then(tagRes => {
						const records = (tagRes && tagRes.data && tagRes.data.records) || []
						this.hotSearchList = uniqueTexts(records.map(item => item.title || item.name)).slice(0, 10)
					})
				}).catch(() => {
					getAllTag(1, 10, { keyword: '' }).then(tagRes => {
						const records = (tagRes && tagRes.data && tagRes.data.records) || []
						this.hotSearchList = uniqueTexts(records.map(item => item.title || item.name)).slice(0, 10)
					}).catch(() => {
						this.hotSearchList = []
					})
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./search.css);
</style>
