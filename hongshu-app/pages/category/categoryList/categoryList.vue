<template>
	<view class="container">
		<hs-nav-bar title="分类笔记"></hs-nav-bar>
		<scroll-view scroll-y class="page" @scrolltolower="loadData">
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
			<hs-empty v-if="!loading && !list.length" title="该分类暂无笔记"></hs-empty>
			<view class="loadStyle" v-if="!isEnd && loading">正在加载中</view>
			<view class="loadStyle" v-if="isEnd && list.length">我也是有底线的~</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		getImgListByCategory
	} from "@/api/category.js"
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
		data() {
			return {
				list: [],
				list1: [],
				list2: [],
				page: 1,
				limit: 8,
				total: 0,
				isEnd: false,
				loading: false,
				cid: '',
				type: 0
			}
		},
		onLoad(options) {
			this.cid = options.cid
			this.type = options.type
			this.getImgListByCategory()
		},
		methods: {
			changeList(e) {
				this[e.name].push(e.value)
			},
			getMoreData(dataList) {
				const records = dataList || []
				if (!records.length) {
					if (this.page <= 1) this.isEnd = true
					return
				}
				this.list = this.list.concat(records.map(item => toNoteCard(mapNoteMedia(item))))
			},
			buildParams() {
				const type = Number(this.type)
				if (type === 3) {
					return {
						keyword: '',
						cid: this.cid,
						cpid: '',
						type: 1
					}
				}
				return {
					keyword: '',
					cid: '',
					cpid: this.cid,
					type: type || 1
				}
			},
			getImgListByCategory() {
				this.loading = true
				getImgListByCategory(this.page, this.limit, this.buildParams()).then(res => {
					const page = res.data || {}
					this.total = page.total || 0
					this.getMoreData(page.records)
					this.loading = false
					if (!this.list.length || this.list.length >= this.total) this.isEnd = true
				}).catch(() => {
					this.loading = false
				})
			},
			loadData() {
				if (this.isEnd || this.loading) return
				this.page += 1
				this.getImgListByCategory()
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
	@import url(./categoryList.css);
</style>
