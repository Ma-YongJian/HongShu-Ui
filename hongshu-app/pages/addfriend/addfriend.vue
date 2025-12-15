<template>
	<view class="container">
		<tui-navigation-bar backgroundColor="#fff" :isFixed="false" :isOpacity="false">
			<view class="nav">
				<view @click="back">
					<tui-icon name="arrowleft" size="25"></tui-icon>
				</view>
				<view class="search">
					<input placeholder="请输入用户名称" class="search-input" v-model="keyword" />
					<tui-button type="danger" @click="searchUser" height="60rpx " width="120rpx"style="border-radius: 30rpx;">搜索</tui-button>
				</view>
			</view>
		</tui-navigation-bar>

		<!-- 当 dataList 为空时显示推荐提示 -->
		<view v-if="dataList.length != 0" class="recommend-tip">
			<p>发现好友</p>
		</view>

		<tui-list-view>
			<tui-list-cell :lineLeft="false" v-for="(item, index) in dataList" :key="index">
				<view class="tui-item-box">
					<view class="tui-msg-box" @click="getUserInfo(item.id)">
						<image :src="item.avatar" class="tui-msg-pic" mode="aspectFill"></image>
						<view class="tui-msg-item">
							<view class="tui-msg-name">{{ item.username }}</view>
							<view class="tui-msg-type">
								<p>红薯号：{{ item.hsId }}</p>
								<p>粉丝：{{ item.fanCount }}</p>
							</view>
						</view>
					</view>
					<view class="tui-msg-right">
						<tui-button v-if='!item.isfollow' @click="follow(item.uid,index)" height="60rpx" width="120rpx"
							style="border-radius: 30rpx; margin-right: 50rpx;" type="danger" :size="24" shape="circle" plain>关注</tui-button>
						<tui-button v-else @click="clearFollow(item.uid,index)" height="60rpx" width="120rpx"
							style="border-radius: 30rpx;" type="gray" :size="24" shape="circle" plain>取消关注</tui-button>
					</view>
				</view>
			</tui-list-cell>
		</tui-list-view>
	</view>
</template>

<script>
	import {
		searchUser
	} from '@/api/user.js'
	import {
		getRecommendUser
	} from "@/api/imgDetail.js"
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
			this.uid = uni.getStorageSync("userInfo").id
			this.getRecommend();
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				})
			},

			getRecommend() {
				let params = {
					uid: uni.getStorageSync("userInfo").id
				}
				getRecommendUser(this.page, this.limit, params).then(res => {
					this.dataList = res.data.records
				})
			},

			searchUser() {
				let params = {
					keyword: this.keyword
				}
				searchUser(this.page, this.limit, params).then(res => {
					this.dataList = res.data.records
				})
			},

			getUserInfo(uid) {
				if (uid == uni.getStorageSync("userInfo").id) {
					uni.switchTab({
						url: "/pages/user/user"
					})
				} else {
					uni.navigateTo({
						url: "/pages/otherUser/otherUser?uid=" + uid
					})
				}
			},
		}
	}
</script>

<style scoped>
	@import url(./addfriend.css);
</style>