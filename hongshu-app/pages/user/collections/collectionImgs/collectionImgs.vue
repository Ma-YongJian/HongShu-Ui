<template>
	<view class="container">
		<uv-waterfall ref="waterfall" v-model="list" column-count="2" :add-time="0" @changeList="changeList"
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
		<hs-empty v-if="!loading && !list.length" title="暂无收藏笔记"></hs-empty>
		<view class="loadStyle" v-if="!isEnd && loading">正在加载中</view>
		<view class="loadStyle" v-if="isEnd && list.length">我也是有底线的~</view>
	</view>
</template>

<script>
	import {
		getAllCollection
	} from "@/api/agreeCollect.js"
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
				list: [],
				list1: [],
				list2: [],
				page: 1,
				limit: 8,
				total: 0,
				isEnd: false,
				loading: false
			}
		},
		watch: {
			seed() {
				this.loadData()
			}
		},
		created() {
			this.getAllCollection()
		},
		methods: {
			changeList(e) {
				this[e.name].push(e.value)
			},
			getAllCollection() {
				this.loading = true
				getAllCollection(this.page, this.limit, {
					uid: this.uid,
					type: 2
				}).then(res => {
					const page = res.data || {}
					this.total = page.total || 0
					const records = (page.records || []).map(item => toNoteCard(mapNoteMedia(item)))
					this.list = this.page === 1 ? records : this.list.concat(records)
					this.loading = false
					if (!this.list.length || this.list.length >= this.total) this.isEnd = true
				}).catch(() => {
					this.loading = false
				})
			},
			loadData() {
				if (this.isEnd || this.loading) return
				this.page += 1
				this.getAllCollection()
			},
			getImgInfo(item) {
				openNote(item)
			},
			goCardUser(item) {
				openUser(item && item.uid)
			}
		}
	}
</script>

<style scoped>
	@import url(./collectionImgs.css);
</style>
