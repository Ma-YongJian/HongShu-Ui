<template>
	<view class="container">
		<hs-nav-bar title="编辑标签" :showBack="false">
			<template #right>
				<view class="nav-done" @click="back">完成</view>
			</template>
		</hs-nav-bar>
		<view class="add-tag">
			<view v-for="(item, index) in tagList" :key="index">
				<view class="badge-item">
					<tui-tag type="white" shape="circle" margin="0 2px">{{ item.title || item }}</tui-tag>
					<view class="shut" @click="deltag(index)"><tui-icon name="shut" size="14"></tui-icon></view>
				</view>
			</view>
		</view>
		<view>
			<input placeholder="输入标签" class="tag-input" @confirm="submit" v-model='content' />
		</view>

		<view class="recommend-tag">
			<view class="ermen"> 热门推荐</view>
			<view class="tags">
				<view v-for="(item, index) in dataList" :key="index">
					<view @click="onSelectTag(index)">
						<tui-tag type="warning" shape="circle" margin="5px 5px">{{ item.title }}</tui-tag>
					</view>
				</view>
			</view>
		</view>
		<!-- 消息提示 -->
		<tui-toast ref="toast"></tui-toast>
	</view>
</template>

<script>
	import {
		getAllTag
	} from "@/api/tag.js"
	export default {
		data() {
			return {
				page: 1,
				limit: 10,
				content: '',
				tagList: [],
				dataList: [],
				mid: '',
				type: '',
			}
		},
		onLoad(option) {
			this.mid = option.mid
			this.type = option.type
		},
		created() {
			this.getAllTag()
			const tags = this.safeParse(uni.getStorageSync("tags"), [])
			this.tagList = Array.isArray(tags) ? tags : []
		},
		methods: {
			safeParse(raw, fallback) {
				if (!raw) return fallback
				try {
					return typeof raw === 'string' ? JSON.parse(raw) : raw
				} catch (e) {
					return fallback
				}
			},
			submit() {
				if (this.tagList.length >= 5) {
					let params = {
						title: "最多支持5个标签",
					}
					this.$refs.toast.show(params);
				} else {
					let tag = {}
					for (var i in this.tagList) {
						if (this.tagList[i].name == this.content) {
							let params = {
								title: "标签已经存在",
							}
							this.$refs.toast.show(params);
							return
						}
					}

					tag.title = this.content
					this.tagList.push(tag)
					this.content = ''
				}
			},
			getAllTag() {
				let params = {
					keyword: this.keyword,
				}
				getAllTag(this.page, this.limit, params).then(res => {
					this.dataList = res.data.records
				})
			},
			deltag(index) {
				this.tagList.splice(index, 1)
			},
			selectTag(item) {
				if (this.tagList.length >= 5) {
					let params = {
						title: "最多支持5个标签",
					}
					this.$refs.toast.show(params);
				} else {
					for (var i in this.tagList) {
						if (this.tagList[i].title == item.title) {
							let params = {
								title: "标签已经存在",
							}
							this.$refs.toast.show(params);
							return
						}
					}

					this.tagList.push(item)
				}

			},
			onSelectTag(index) {
				this.selectTag(this.dataList[index])
			},
			back() {
				uni.setStorageSync("tags", JSON.stringify(this.tagList || []))
				uni.navigateBack({
					delta: 1
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./addtag.css);
</style>