<template>
	<view class="container">
		<hs-nav-bar title="浏览记录">
			<template #right>
				<view class="hs-nav-action" @click="delhistory">
					<tui-icon name="more-fill" size="22"></tui-icon>
				</view>
			</template>
		</hs-nav-bar>

		<scroll-view scroll-y class="page" @scrolltolower="loadData">
			<tui-grid :unlined="true">
				<block v-for="(item, index) in dataList" :key="index">
					<tui-grid-item :cell="2" :border="false" :bottomLine="false">
						<view class="card">
							<view class="del-title">
								<view class="del-cicle" v-if="isshow && !delMids.includes(item.id)">
									<tui-icon name="circle" color="#f4f4f4" size="24"
										@click="delAffirm(item.id)"></tui-icon>
								</view>
								<view class="del-affirm" v-if="isshow && delMids.includes(item.id)"><tui-icon
										name="circle-fill" color="#3d8af5" size="24"
										@click="delCancel(item.id)"></tui-icon>
								</view>
							</view>
							<view @click="onOpenHistory(index)">
								<image class="cover" :src="item.noteCover" mode="aspectFill" :lazy-load="true" />
							</view>
							<view class="cont">
								<view class="content">{{ item.title }}</view>
								<view class="userInfo">
									<view class="avatar-usrname">
										<image :src="item.avatar" mode="aspectFill" :lazy-load="true" />
										<view class="username">{{ item.username }}</view>
									</view>
									<view class="agreeCount">
										<tui-icon name="like" size="14" v-if="!item.isLike"></tui-icon>
										<tui-icon name="like-fill" size="14" v-else style="color: red;"></tui-icon>
										{{ item.likeCount}}
									</view>
								</view>
							</view>
						</view>
					</tui-grid-item>
				</block>
			</tui-grid>
			<hs-empty v-if="!loading && !dataList.length" title="暂无浏览记录" tip="去发现页看看笔记吧"></hs-empty>
			<view class="loadStyle" v-if="!isEnd && loading">正在加载中</view>
			<view class="loadStyle" v-if="isEnd">我也是有底线的~</view>
		</scroll-view>

		<view class="fotter" v-if="isshow">
			<view class="f-left">
				<view class="f-del-cicle" v-if="T">
					<tui-icon name="circle" color="#d6d6d6" size="28" @click="isAll"></tui-icon>
				</view>
				<view class="del-affirm" v-else><tui-icon name="circle-fill" color="#3d8af5" size="28"
						@click="cancalAll"></tui-icon></view>
				全选
			</view>
			<view class="f-right">
				<tui-button type="danger" height="60rpx" @click="delRecord" :size='28'>删除</tui-button>
			</view>
		</view>

		<tui-toast ref="toast"></tui-toast>
	</view>
</template>

<script>
	import {
		getAllBrowseRecordByUser,
		delRecord
	} from "@/api/browseRecord.js"
	import {
		mapNoteMedia
	} from '@/utils/upload.js'
	import {
		openNote,
		currentUid,
		noteDeletedMixin
	} from '@/utils/noteNav.js'
	export default {
		mixins: [noteDeletedMixin],
		data() {
			return {
				dataList: [],
				page: 1,
				limit: 12,
				total: 0,
				userInfo: {},
				isEnd: false, //是否到底底部了
				loading: false, //是否正在加载
				isshow: false,
				affirmId: '',
				delMids: [],
				T: true,
			}
		},
		created() {
			this.userInfo = uni.getStorageSync("userInfo")
			this.getAllBrowseRecordByUser()
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			getAllBrowseRecordByUser() {
				if (!currentUid()) {
					this.dataList = []
					this.isEnd = true
					return
				}
				getAllBrowseRecordByUser(this.page, this.limit, {
					uid: currentUid()
				}).then(res => {
					const list = Array.isArray(res.data) ? res.data : ((res.data && res.data.records) || [])
					this.dataList = list.map(mapNoteMedia)
					this.total = this.dataList.length
					this.isEnd = this.dataList.length < this.limit
					this.loading = false
				}).catch(() => {
					this.dataList = []
					this.isEnd = true
					this.loading = false
				})
			},
			loadData() {
				if (this.isEnd || this.loading) return
				this.loading = true
				this.page = this.page + 1
				getAllBrowseRecordByUser(this.page, this.limit, {
					uid: currentUid()
				}).then(res => {
					const list = Array.isArray(res.data) ? res.data : ((res.data && res.data.records) || [])
					this.dataList.push(...list.map(mapNoteMedia))
					this.loading = false
					if (!list.length || list.length < this.limit) this.isEnd = true
				}).catch(() => {
					this.loading = false
				})
			},
			toMain(item) {
				openNote(item)
			},
			onOpenHistory(index) {
				this.toMain(this.dataList[index])
			},
			delhistory() {
				this.isshow = !this.isshow
				if (this.isshow == false) {
					this.delMids = []
				}
			},
			delAffirm(mid) {
				this.delMids.push(mid)
			},
			isAll() {
				this.T = false
				this.dataList.forEach(item => {
					this.delMids.push(item.id)
				})
			},
			cancalAll() {
				this.T = true
				this.delMids = []
			},
			delCancel(mid) {
				let index = this.delMids.indexOf(mid)
				this.delMids.splice(index, 1)

			},
			//删除浏览记录
			delRecord() {
				delRecord(this.delMids, this.userInfo.id).then(res => {
					let params = {
						title: "删除成功",
						imgUrl: "/static/images/toast/check-circle.png",
						icon: true
					}
					this.$refs.toast.show(params);
					this.getAllBrowseRecordByUser()
				})
			}
		}
	}
</script>

<style scoped>
	@import url(./history.css);
</style>