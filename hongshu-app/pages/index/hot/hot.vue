<template>
	<view class="container">
		<scroll-view scroll-y class="page">
			<view class="item-hot" v-for="(item, index) in dataList" :key="index">
				<view class="item-hot-left">{{ index + 1 }}</view>
				<view class="item-hot-right">
					<view class="item-hot-top">
						<view class="top-left">
							<view class="avatar" @click="getUserInfo(item.uid)">
								<image :src="item.avatar" mode="aspectFill" :lazy-load="true" />
							</view>
							<view class="username">{{ item.username }}</view>
						</view>
						<view class="top-right">
							<tui-icon name="like-fill" size="14" color="#ff5500"></tui-icon>
							{{ item.likeCount }}
						</view>
					</view>

					<view class="content">{{ item.title }}</view>

					<view class="images" @click="toMain(item.id)">
						<view v-for="(img, index) in JSON.parse(item.urls)" :key="index" v-show="index < 3">
							<image :src="img" mode="aspectFill" :lazy-load="true" class="fadeImg" />
						</view>
						<view class="nums" v-if="item.count > 3">+{{ item.count - 3 }}</view>
					</view>
				</view>
			</view>

			<view class="loadStyle" v-if="isEnd">我也是有底线的~</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		getHot
	} from "@/api/imgDetail.js";
	import {
		addBrowseRecord
	} from "@/api/browseRecord.js";

	export default {
		data() {
			return {
				limit: 20,
				dataList: [],
				isEnd: false,
			};
		},
		created() {
			this.loadData();
		},
		methods: {
			loadData() {
				getHot(1, this.limit).then((res) => {
					this.dataList = res.data.records;
					this.isEnd = this.dataList.length >= this.limit;
				});
			},
			getUserInfo(uid) {
				if (uid === uni.getStorageSync("userInfo").id) {
					uni.switchTab({
						url: "/pages/user/user",
					});
				} else {
					uni.navigateTo({
						url: `/pages/otherUser/otherUser?uid=${uid}`,
					});
				}
			},
			toMain(mid) {
				const data = {
					uid: uni.getStorageSync("userInfo").id,
					mid,
				};

				addBrowseRecord(data).then(() => {
					uni.navigateTo({
						url: `/pages/main/main?mid=${mid}`,
					});
				});
			},
		},
	};
</script>

<style scoped>
	@import url("./hot.css");
</style>