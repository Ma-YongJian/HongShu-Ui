<template>
	<view class="container">
		<hs-nav-bar>
			<template #center>
				<view class="search">
					<input placeholder="请输入用户名称" class="search-input" v-model="keyword" />
					<tui-button type="primary" @click="searchUser" height="60rpx " width="120rpx" style="border-radius: 30rpx;">搜索</tui-button>
				</view>
			</template>
		</hs-nav-bar>

		<!-- 当 dataList 为空时显示推荐提示 -->
		<view v-if="dataList.length != 0" class="recommend-tip">
			<p>发现好友</p>
		</view>

		<tui-list-view>
			<tui-list-cell :lineLeft="false" v-for="(item, index) in dataList" :key="index">
				<view class="tui-item-box">
					<view class="tui-msg-box" @click="getUserInfo(item.id)">
						<image :src="mediaUrl(item.avatar)" class="tui-msg-pic" mode="aspectFill"></image>
						<view class="tui-msg-item">
							<view class="tui-msg-name">{{ item.username }}</view>
							<view class="tui-msg-type">
								<p>来因号：{{ item.hsId }}</p>
								<p>粉丝：{{ item.fanCount }}</p>
							</view>
						</view>
					</view>
					<view class="tui-msg-right">
						<tui-button v-if='!item.isFollow && !item.isfollow' @click="followAt(index)" height="60rpx" width="120rpx"
							style="border-radius: 30rpx; margin-right: 50rpx;" type="primary" :size="24" shape="circle" plain>关注</tui-button>
						<tui-button v-else @click="clearFollowAt(index)" height="60rpx" width="120rpx"
							style="border-radius: 30rpx;" type="gray" :size="24" shape="circle" plain>取消关注</tui-button>
					</view>
				</view>
			</tui-list-cell>
		</tui-list-view>
		<hs-empty v-if="!dataList.length" title="暂无推荐用户" tip="试试搜索用户名"></hs-empty>
	</view>
</template>

<script>
	import {
		searchUser
	} from '@/api/user.js'
	import {
		getRecommendUser
	} from "@/api/imgDetail.js"
	import {
		followUser,
		clearFollow
	} from '@/api/follow.js'
	import {
		mediaUrl
	} from '@/utils/upload.js'
	import {
		openUser
	} from '@/utils/noteNav.js'
	export default {
		data() {
			return {
				keyword: '',
				page: 1,
				limit: 10,
				dataList: [],
				uid: '',
			}
		},
		created() {
			const userInfo = uni.getStorageSync("userInfo") || {}
			this.uid = userInfo.id
			this.getRecommend();
		},
		methods: {
			mediaUrl,
			pickRecords(res) {
				if (!res || res.data == null) return []
				if (Array.isArray(res.data)) return res.data
				return res.data.records || []
			},
			back() {
				uni.navigateBack({
					delta: 1
				})
			},

			getRecommend() {
				const kw = (this.keyword || '').trim()
				if (kw) {
					this.searchUser()
					return
				}
				getRecommendUser(this.page, this.limit, {
					uid: this.uid
				}).then(res => {
					this.dataList = this.pickRecords(res)
				}).catch(() => {
					this.dataList = []
				})
			},

			searchUser() {
				const keyword = (this.keyword || '').trim()
				if (!keyword) {
					this.getRecommend()
					return
				}
				searchUser(this.page, this.limit, {
					keyword
				}).then(res => {
					this.dataList = this.pickRecords(res)
				}).catch(() => {
					this.dataList = []
				})
			},

			getUserInfo(uid) {
				openUser(uid)
			},
			follow(fid, index) {
				followUser({
					followerId: fid
				}).then(() => {
					this.$set(this.dataList[index], 'isFollow', true)
					this.$set(this.dataList[index], 'isfollow', true)
				})
			},
			followAt(index) {
				const row = this.dataList[index] || {}
				this.follow(row.id || row.uid, index)
			},
			clearFollow(fid, index) {
				clearFollow({
					followerId: fid
				}).then(() => {
					this.$set(this.dataList[index], 'isFollow', false)
					this.$set(this.dataList[index], 'isfollow', false)
				})
			},
			clearFollowAt(index) {
				const row = this.dataList[index] || {}
				this.clearFollow(row.id || row.uid, index)
			}
		}
	}
</script>

<style scoped>
	@import url(./addfriend.css);
</style>