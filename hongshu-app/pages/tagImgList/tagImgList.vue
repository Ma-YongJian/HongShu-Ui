<template>
	<view class="container">
		<hs-nav-bar :title="tag.name || tag.title || '标签'"></hs-nav-bar>
		<tui-tabs :tabs="tabs" :currentTab="type" itemWidth="50%" @change="change" :width="200" sliderBgColor="#3d8af5"
			selectedColor="#3d8af5"></tui-tabs>
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
			<hs-empty v-if="!loading && !list.length" title="该标签暂无笔记"></hs-empty>
			<view class="loadStyle" v-if="!isEnd && loading">正在加载中</view>
			<view class="loadStyle" v-if="isEnd && list.length">我也是有底线的~</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		getOneTag,
		getImgListByTagId
	} from "@/api/tag.js"
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
				tag: {},
				tabs: [{
					name: "最新"
				}, {
					name: "热门"
				}],
				list: [],
				list1: [],
				list2: [],
				page: 1,
				limit: 8,
				total: 0,
				isEnd: false,
				loading: false,
				type: 0
			}
		},
		onLoad(options) {
			this.getOneTag(options.tid)
		},
		methods: {
			change(e) {
				this.type = e.index
				this.list = []
				this.list1 = []
				this.list2 = []
				this.page = 1
				this.total = 0
				this.isEnd = false
				if (this.$refs.waterfall) this.$refs.waterfall.clear()
				this.getImgListByTagId()
			},
			getMoreData(dataList) {
				const records = dataList || []
				if (!records.length) {
					if (this.page <= 1) this.isEnd = true
					return
				}
				this.list = this.list.concat(records.map(item => toNoteCard(mapNoteMedia(item))))
			},
			getOneTag(id) {
				getOneTag({
					id
				}).then(res => {
					this.tag = res.data || {}
					this.getImgListByTagId()
				})
			},
			getImgListByTagId() {
				this.loading = true
				getImgListByTagId(this.page, this.limit, {
					id: this.tag.id,
					type: this.type
				}).then(res => {
					const page = res.data || {}
					this.total = page.total || 0
					this.getMoreData(page.records)
					this.loading = false
					if (!this.list.length || this.list.length >= this.total) this.isEnd = true
				}).catch(() => {
					this.loading = false
				})
			},
			changeList(e) {
				this[e.name].push(e.value)
			},
			loadData() {
				if (this.isEnd || this.loading) return
				this.page += 1
				this.getImgListByTagId()
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
	@import url(./tagImgList.css);
</style>
