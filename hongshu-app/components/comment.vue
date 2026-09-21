<template>
	<view class="container">
		<view v-for="(commentOne, index) in dataList" :key="index"
			class="comment-row" :id="'two-' + commentOne.id"
			:class="{ 'is-hl': bgcolorId == commentOne.id }">
			<view class="item-top">
				<view class="left">
					<image :src="commentOne.avatar" mode="aspectFill" @click="onTapUser(index)" />
					<view class="username">{{ commentOne.username }}</view>
					<view class="author-badge" v-if="commentOne.uid == currentUid">作者</view>
				</view>
				<view class="right">
					<tui-icon v-if="commentOne.isLike" name="like-fill" :size="15" color="#ff2442"
						@click="onUnlike(index, -1)"></tui-icon>
					<tui-icon v-else name="like" :size="15" @click="onLike(index, -1)"></tui-icon>
					<view class="ziti">{{ commentOne.likeCount || 0 }}</view>
				</view>
			</view>
			<view class="item-main" @click="onTapMain(index)">
				<text>{{ commentOne.content }}</text>
				<text class="time">{{ commentOne.time }}</text>
			</view>

			<view v-if="commentOne.children && commentOne.children.length" class="reply-wrap">
				<view v-for="(commentTwo, index2) in commentOne.children" :key="index2"
					class="comment-two" :id="'two-' + commentTwo.id"
					:class="{ 'is-hl': bgcolorId == commentTwo.id }">
					<view class="item-top">
						<view class="left">
							<image :src="commentTwo.avatar" mode="aspectFill" @click="onTapReplyUser(index, index2)" />
							<view class="username">{{ commentTwo.username }}</view>
							<view class="author-badge" v-if="commentTwo.uid == currentUid">作者</view>
						</view>
						<view class="right">
							<tui-icon v-if="commentTwo.isLike" name="like-fill" :size="15" color="#ff2442"
								@click="onUnlike(index, index2)"></tui-icon>
							<tui-icon v-else name="like" :size="15" @click="onLike(index, index2)"></tui-icon>
							<view class="ziti">{{ commentTwo.likeCount || 0 }}</view>
						</view>
					</view>
					<view class="item-main" @click="onTapReply(index, index2)">
						<text v-if="commentTwo.replyUsername">回复</text>
						<text v-if="commentTwo.replyUsername" class="reply">{{ commentTwo.replyUsername }}</text>
						<text v-if="commentTwo.replyUsername">：</text>
						<text>{{ commentTwo.content }}</text>
						<text class="time">{{ commentTwo.time }}</text>
					</view>
				</view>
				<view class="other"
					v-if="commentOne.twoCommentCount > commentOne.children.length"
					@click="onLoadMore(index)">
					点击加载更多
				</view>
			</view>
		</view>

		<tui-actionsheet :show="showActionSheet" :item-list="itemList" @click="itemClick" @cancel="closeActionSheet">
		</tui-actionsheet>

		<view class="loadStyle" v-if="isEnd && dataList.length">我也是有底线的~</view>
	</view>
</template>

<script>
	import {
		getAllComment,
		getAllTwoCommentByOneId,
		delComment,
		scrollComment
	} from "@/api/comment.js"
	import {
		timeAgo
	} from "../utils/webUtils";
	import {
		mediaUrl
	} from '@/utils/upload.js'
	import {
		openUser,
		currentUid
	} from '@/utils/noteNav.js'

	export default {
		name: "comment",
		props: {
			mid: {
				type: [String, Number],
				default: ''
			},
			seed: Number,
			val: Number,
			commentInfo: Object,
			currentUid: {
				type: [String, Number],
				default: ''
			},
			//滑动评论
			comArr: Array,
		},
		data() {
			return {
				dataList: [],
				page1: 1,
				limit1: 6,
				total1: 0,
				page2: 1,
				limit2: 4,
				total2: 0,

				isEnd: false, //是否到底底部了

				twoMap: {},

				//点击索引
				index: -1,
				index2: -1,

				//添加的记录id用户筛选
				commentIds: [],

				//滚动评论
				bgcolorId: '',
				isScroll: false,
				scrollTwoData: [],

				search: false,


				showActionSheet: false,

				itemList: [{
					text: "回复",
					color: "#2B2B2B"
				}, {
					text: "删除",
					color: "#ff0000"
				}],
				clickComment: {},

			};
		},
		watch: {

			seed(newVal, oldVal) {

				//这是trendComment组件传递的数据，如果是mian页面的评论不需要
				this.page1 = 1
				this.dataList = []
				this.getAllComment()
			},
			val(newVal, oldVal) {
				this.page1 = this.page1 + 1
				this.loadData()
			},
			mid: {
				immediate: true,
				handler(val) {
					if (!val) return
					this.page1 = 1
					this.dataList = []
					this.isEnd = false
					this.getAllComment()
				}
			},
			commentInfo(newVal, oldVal) {
				//将comment添加到数组
				this.addComment(newVal)
			},
		},

		mounted() {
			this.twoMap = new Map()
			this.uid = (uni.getStorageSync("userInfo") || {}).id
			if (this.comArr && this.comArr[0] != null) {
				this.scrollComment(this.comArr[0])
			}
		},

		created() {

		},

		methods: {
			mediaUrl,
			pickComment(index, index2) {
				const row = this.dataList[index]
				if (!row) return null
				if (index2 == null || index2 < 0) return row
				const kids = row.children || []
				return kids[index2] || null
			},
			onTapUser(index) {
				const row = this.pickComment(index, -1)
				if (row) this.getUserInfo(row.uid)
			},
			onTapReplyUser(index, index2) {
				const row = this.pickComment(index, index2)
				if (row) this.getUserInfo(row.uid)
			},
			onTapMain(index) {
				const row = this.pickComment(index, -1)
				if (row) this.onTapComment(row, index, -1)
			},
			onTapReply(index, index2) {
				const row = this.pickComment(index, index2)
				if (row) this.onTapComment(row, index, index2)
			},
			onLike(index, index2) {
				const row = this.pickComment(index, index2)
				if (row) this.addAgree(row, index, index2)
			},
			onUnlike(index, index2) {
				const row = this.pickComment(index, index2)
				if (row) this.cancelAgree(row, index, index2)
			},
			onLoadMore(index) {
				const row = this.pickComment(index, -1)
				if (row) this.loadMore(row.id, index)
			},
			getUserInfo(uid) {
				openUser(uid)
			},
			isAuthor(uid) {
				return uid && this.currentUid && String(uid) === String(this.currentUid)
			},
			repliesOf(item) {
				if (!item) return []
				return item.children || item.childrenComments || []
			},
			replyCount(item) {
				if (!item) return 0
				return Number(item.twoCommentCount || item.twoNums || this.repliesOf(item).length || 0)
			},
			formatTime(value) {
				if (value == null || value === '') return ''
				if (typeof value === 'string' && /[秒分钟小时天周月年前刚]/.test(value)) return value
				const ts = typeof value === 'number' ? value : new Date(value).getTime()
				if (!ts) return ''
				return timeAgo(ts)
			},
			mapComment(item) {
				if (!item) return item
				item.time = this.formatTime(item.time || item.createDate || item.createTime)
				item.avatar = mediaUrl(item.avatar)
				item.likeCount = Number(item.likeCount || item.count || 0)
				item.isLike = !!(item.isLike || item.isAgree)
				const kids = this.repliesOf(item)
				item.children = kids.map(child => {
					child.time = this.formatTime(child.time || child.createDate || child.createTime)
					child.avatar = mediaUrl(child.avatar)
					child.likeCount = Number(child.likeCount || child.count || 0)
					child.isLike = !!(child.isLike || child.isAgree)
					if (child.id) this.commentIds.push(child.id)
					return child
				})
				item.twoCommentCount = this.replyCount(item)
				return item
			},
			parsePage(res) {
				const data = (res && res.data) || {}
				const page = Array.isArray(data.records) ? data : (data.data || data)
				const records = page.records || page.list || []
				return {
					records: Array.isArray(records) ? records : [],
					total: Number(page.total || 0)
				}
			},
			onTapComment(comment, index, index2) {
				const me = this.uid
				const canDelete = me && (String(comment.uid) === String(me) || String(this.currentUid) === String(me))
				if (canDelete) {
					this.commentOperate(comment, index, index2)
				} else {
					this.clickItem(comment, index)
				}
			},
			getAllComment() {
				if (!this.mid) return
				const params = {
					noteId: this.mid,
					nid: this.mid,
					mid: this.mid,
					uid: currentUid()
				}
				getAllComment(this.page1, this.limit1, params).then(res => {
					const page = this.parsePage(res)
					this.dataList = page.records.map(item => this.mapComment(item))
					this.total1 = page.total
					this.isEnd = !this.dataList.length || this.dataList.length >= this.total1
				}).catch(() => {
					this.dataList = []
					this.isEnd = true
				})
			},
			loadData() {
				if (!this.mid) return
				if (this.dataList.length >= this.total1) {
					this.isEnd = true
					return
				}
				const params = {
					noteId: this.mid,
					nid: this.mid,
					mid: this.mid,
					uid: currentUid()
				}
				getAllComment(this.page1, this.limit1, params).then(res => {
					const page = this.parsePage(res)
					page.records.forEach(item => {
						this.dataList.push(this.mapComment(item))
					})
					this.total1 = page.total || this.total1
					this.isEnd = this.dataList.length >= this.total1
				})
			},
			loadMore(cid, index) {
				this.page2 = (this.twoMap.get(index) || 1) + 1
				this.twoMap.set(index, this.page2)
				getAllTwoCommentByOneId(this.page2, this.limit2, {
					oneCommentId: cid
				}).then(res => {
					const records = (res.data && res.data.records) || []
					if (!this.dataList[index].children) this.$set(this.dataList[index], 'children', [])
					records.forEach(item => {
						if (!this.commentIds.includes(item.id)) {
							this.dataList[index].children.push(this.mapComment(item))
							this.commentIds.push(item.id)
						}
					})
				})
			},

			clickItem(comment, index) {
				this.$emit('getComment', comment);
				this.index = index
				this.T = true
			},

			addComment(comment) {
				comment = this.mapComment(comment || {})
				comment.time = comment.time || '刚刚'
				const pid = comment.pid == null ? '0' : String(comment.pid)
				if (pid === '0') {
					if (!comment.children) comment.children = []
					this.dataList.unshift(comment)
				} else if (this.index >= 0 && this.dataList[this.index]) {
					const parent = this.dataList[this.index]
					parent.twoCommentCount = Number(parent.twoCommentCount || 0) + 1
					if (!parent.children) this.$set(parent, 'children', [])
					parent.children.unshift(comment)
				}
			},

			//隐藏组件
			closeActionSheet() {
				this.showActionSheet = false
				this.$emit('delComment', false);
			},
			//调用此方法显示组件
			commentOperate(comment, index, index2) {
				this.clickComment = comment;
				this.index = index;
				this.index2 = index2
				this.showActionSheet = true;
				this.$emit('delComment', true);
			},
			itemClick(e) {
				const index = e && e.index
				this.closeActionSheet();
				if (index == 0) {
					this.clickItem(this.clickComment, this.index)
					return
				}
				if (index == 1) {
					this.deleteComment()
				}
			},
			deleteComment() {
				const comment = this.clickComment
				if (!comment || !comment.id) return
				uni.showModal({
					title: '提示',
					content: '确定删除这条评论？',
					success: (m) => {
						if (!m.confirm) return
						delComment({
							commentId: comment.id
						}).then(res => {
							if (!res || res.code !== 200) {
								uni.showToast({
									title: (res && (res.message || res.msg)) || '删除失败',
									icon: 'none'
								})
								return
							}
							if (String(comment.pid || '0') === '0') {
								this.dataList.splice(this.index, 1)
							} else if (this.dataList[this.index]) {
								const parent = this.dataList[this.index]
								parent.twoCommentCount = Math.max(0, Number(parent.twoCommentCount || 1) - 1)
								if (parent.children) parent.children.splice(this.index2, 1)
							}
							uni.showToast({
								title: '删除成功',
								icon: 'none'
							})
						})
					}
				})
			},

			addAgree(comment, index, index2) {
				if (index2 == null || index2 < 0 || String(comment.pid || '0') === '0') {
					this.dataList[index].likeCount = Number(this.dataList[index].likeCount || 0) + 1
					this.dataList[index].isLike = true
				} else if (this.dataList[index] && this.dataList[index].children && this.dataList[index].children[index2]) {
					const child = this.dataList[index].children[index2]
					child.likeCount = Number(child.likeCount || 0) + 1
					child.isLike = true
				}
				this.$emit('addAgree', comment);
			},
			cancelAgree(comment, index, index2) {
				if (index2 == null || index2 < 0 || String(comment.pid || '0') === '0') {
					this.dataList[index].likeCount = Math.max(0, Number(this.dataList[index].likeCount || 1) - 1)
					this.dataList[index].isLike = false
				} else if (this.dataList[index] && this.dataList[index].children && this.dataList[index].children[index2]) {
					const child = this.dataList[index].children[index2]
					child.likeCount = Math.max(0, Number(child.likeCount || 1) - 1)
					child.isLike = false
				}
				this.$emit('cancelAgreeComment', comment);
			},

			scrollComment(cid) {
				console.log("滚动评论")
				let params = {
					id: cid,
					noteId: this.mid,
					uid: this.uid
				}

				if (this.comArr[1] == 0) {

					scrollComment(params).then(res => {

						res.data.records.forEach(item => {
							item.time = timeAgo(new Date(item.createDate))

							if (item.childrenComments.length)

								if (item.twoNums > 0) {
									item.childrenComments[0].time = timeAgo(new Date(item.childrenComments[
											0]
										.createDate))
									this.commentIds.push(item.childrenComments[0].id)
								}

							this.dataList.push(item)
						})

						this.total1 = res.data.total

						for (var i = 0; i < this.total1; i++) {
							this.twoMap.set(i, 0);
						}

						this.page1 = res.data.page1

					})
				} else {
					scrollComment(params).then(res => {
						const data = res.data.records
						let index = 0

						for (var i = 0; i < data.length; i++) {
							data[i].time = timeAgo(new Date(data[i].createDate))
							if (data[i].childrenComments != null) {
								let childs = data[i].childrenComments

								for (var j = 0; j < childs.length; j++) {
									childs[j].time = timeAgo(new Date(childs[j].createDate))
									if (childs[j].id == cid) {
										index = i;
									}
								}
							}

							this.dataList.push(data[i])
						}

						this.total1 = res.data.total

						for (var i = 0; i < this.total1; i++) {
							this.twoMap.set(i, 0);
						}

						this.page1 = res.data.page1
						this.page2 = res.data.page2
						this.twoMap.set(index, this.page2)
					})
				}

				this.scroll(cid)

			},

			//滚动到当前评论
			scroll(commentId) {

				this.bgcolorId = commentId

				setTimeout(e => {

					const query = uni.createSelectorQuery().in(this)

					query.select(`#two-` + commentId).boundingClientRect(data => {

						this.$emit('scrollTop', data.top);

					}).exec();
				}, 500)

				setTimeout(() => {
					this.bgcolorId = ''
				}, 2000)


			},

		},

	}
</script>

<style scoped>
	.container {
		padding: 0 0 40rpx 0;
	}

	.comment-row {
		padding: 8rpx 0 16rpx;
	}

	.comment-row.is-hl,
	.comment-two.is-hl {
		background-color: #f7f7f7;
		border-radius: 12rpx;
	}

	.reply-wrap {
		margin-top: 8rpx;
	}

	ul {
		padding: 0rpx;
	}

	li {
		list-style: none;
		margin-top: 24rpx;
	}

	.username {
		max-width: 280rpx;
		height: auto;
		margin-left: 12rpx;
		font-size: 26rpx;
		color: #afafb0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.author-badge {
		margin-left: 10rpx;
		padding: 4rpx 12rpx;
		border-radius: 999rpx;
		background-color: #ffe8ed;
		color: #ff2442;
		font-size: 20rpx;
		font-weight: 600;
		line-height: 1.2;
		flex-shrink: 0;
	}

	.item-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.left {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.left image {
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		flex-shrink: 0;
		background: #f3f4f6;
	}

	.right {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.ziti {
		margin-left: 4rpx;
		color: #7d7d7d;
		font-size: 24rpx;
	}

	.comment-two {
		margin-top: 16rpx;
		margin-left: 80rpx;
	}

	.other {
		margin-left: 160rpx;
		margin-top: 8rpx;
		color: #636363;
		font-size: 24rpx;
	}

	.reply {
		color: #939393;
	}

	.time {
		margin-left: 10rpx;
		color: #afafb0;
		font-size: 20rpx;
	}

	.item-main {
		margin: 8rpx 0 0 82rpx;
		font-size: 28rpx;
		color: #383c3c;
		line-height: 1.5;
		word-break: break-word;
	}

	.loadStyle {
		margin-top: 40rpx;
		width: 100%;
		height: 60rpx;
		text-align: center;
		color: #bfbfbf;
		padding-bottom: 40rpx;
	}
</style>