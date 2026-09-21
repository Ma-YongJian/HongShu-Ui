<template>
	<view class="container">
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
		<hs-empty v-if="!loading && !dataList.length" title="暂无作品"></hs-empty>
		<view class="loadStyle" v-if="!isEnd && loading">正在加载中</view>
		<view class="loadStyle" v-if="isEnd && dataList.length">我也是有底线的~</view>
	</view>
</template>

<script>
	import {
		getTrendByUser,
		getUserInfo
	} from "@/api/user.js"
	import {
		mapNoteMedia
	} from '@/utils/upload.js'
	import {
		openNote,
		openUser,
		toNoteCard,
		noteDeletedMixin
	} from '@/utils/noteNav.js'
	export default {
		mixins: [noteDeletedMixin],
		props: {
			uid: String,
			seed: Number,
		},
		data() {
			return {
				page: 1,
				limit: 8,
				userInfo: {},
				dataList: [],
				list1: [],
				list2: [],
				isEnd: false,
				loading: false,
				total: 0
			}
		},
		watch: {
			seed() {
				this.loadData()
			}
		},
		created() {
			this.getUserInfo(this.uid)
		},
		methods: {
			changeList(e) {
				this[e.name].push(e.value)
			},
			getImgInfo(item) {
				openNote(item)
			},
			goCardUser(item) {
				openUser((item && item.uid) || this.uid)
			},
			getTrendByUser() {
				this.loading = true
				getTrendByUser(this.page, this.limit, {
					userId: this.uid || this.userInfo.id,
					type: 1,
					status: -1
				}).then(res => {
					const page = res.data || {}
					this.total = page.total || 0
					const records = (page.records || []).map(item => toNoteCard(mapNoteMedia(item)))
					this.dataList = this.page === 1 ? records : this.dataList.concat(records)
					this.loading = false
					if (!this.dataList.length || this.dataList.length >= this.total) this.isEnd = true
				}).catch(() => {
					this.loading = false
					if (this.page <= 1) this.isEnd = true
				})
			},
			getUserInfo(uid) {
				getUserInfo({
					userId: uid
				}).then(res => {
					this.userInfo = res.data || {}
					this.getTrendByUser()
				}).catch(() => {
					this.getTrendByUser()
				})
			},
			loadData() {
				if (this.isEnd || this.loading) return
				this.page += 1
				this.getTrendByUser()
			}
		}
	}
</script>

<style scoped>
	@import url(./notes.css);
</style>
