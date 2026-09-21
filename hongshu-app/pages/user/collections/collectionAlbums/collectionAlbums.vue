<template>
	<view class="container">
		<scroll-view scroll-y class="page" @scrolltolower="loadData">
			<tui-grid :unlined="true">
				<block v-for="(item, index) in dataList" :key="index">
					<tui-grid-item :cell="2" backgroundColor="#f4f4f4" :border="false" :bottomLine="false">
						<view class="card">
							<view @click="searchAlbum(item.aid)">
								<image :src="mediaUrl(item.cover)" mode="aspectFill" :lazy-load='true' />
							</view>
							<view class="cont">
								<h5>{{ item.name }}</h5>
								<p>{{ item.imgCount }}张图片 | {{ item.collectionCount }}人收藏</p>
							</view>
						</view>
					</tui-grid-item>
				</block>
			</tui-grid>
			<hs-empty v-if="!dataList.length" title="暂无收藏专辑"></hs-empty>
			<view class="loadStyle" v-if="isEnd">我也是有底线的~</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		getAllCollection
	} from "@/api/agreeCollect.js"
	import {
		mediaUrl
	} from '@/utils/upload.js'
	export default {

		data() {
			return {
				page: 1,
				limit: 4,
				total: 0,
				isEnd: false,
				dataList: [],
			}
		},
		props: {
			uid: String,
		},
		watch: {

		},
		created() {

			this.getAllCollection()
		},
		methods: {
			mediaUrl,
			getAllCollection() {
				getAllCollection(this.page, this.limit, {
					uid: this.uid,
					type: 3
				}).then(res => {
					const page = res.data || {}
					this.dataList = page.records || []
					this.total = page.total || this.dataList.length
					if (!this.dataList.length || this.dataList.length >= this.total) this.isEnd = true
				})
			},

			searchAlbum(albumId) {
				uni.navigateTo({
					url: "/pages/user/albums/albumInfo?albumId=" + albumId
				})
			},

			loadData() {

				if (this.dataList.length >= this.total) {
					this.isEnd = true
					return
				}

				this.page = this.page + 1;
				let params = {
					uid: this.uid,
					type: 1
				}
				getAllCollection(this.page, this.limit, {
					uid: this.uid,
					type: 3
				}).then(res => {
					const page = res.data || {}
					this.dataList.push(...(page.records || []))
				})
			}

		}
	}
</script>

<style scoped>
	@import url(./collectionAlbums.css);
</style>