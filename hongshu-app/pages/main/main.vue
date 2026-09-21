<template>
	<view class="detail-page">
		<hs-nav-bar :isFixed="true" :border="false">
			<template #center>
				<view class="nav-author" @click="goAuthor">
					<image class="nav-avatar" :src="imgInfo.avatar" mode="aspectFill" />
					<view class="nav-name">{{ imgInfo.username }}</view>
				</view>
			</template>
			<template #right>
				<view v-if="!isCurrentUser" class="nav-follow" :class="{ 'is-on': T }" @click.stop="toggleFollow">
					{{ T ? '已关注' : '关注' }}
				</view>
				<view class="hs-nav-action" @click="openMoreMenu">
					<tui-icon name="more-fill" :size="20"></tui-icon>
				</view>
			</template>
		</hs-nav-bar>
		<view v-if="loadError" class="media-empty" @click="reloadNote">加载失败，点击重试</view>
		<view v-else-if="isVideo && videoSrc" class="media media-video">
				<video :src="videoSrc" :poster="coverSrc" controls object-fit="contain"
					style="width: 100%; height: 1000rpx;"></video>
			</view>
			<view v-else-if="imgList.length" class="media" :style="mediaStyle">
				<swiper :autoplay="false" :indicator-dots="false" :circular="true" :current="swiperCurrent"
					:style="mediaStyle" @change="onSwiperChange">
					<swiper-item v-for="(item, index) in imgList" :key="index">
						<image :src="item" mode="aspectFill" @click="previewImgae(index)" :style="mediaImgStyle" />
					</swiper-item>
				</swiper>
				<view v-if="imgList.length > 1" class="hs-swiper-dots">
					<view v-for="(item, idx) in imgList" :key="idx" class="hs-swiper-dot"
						:class="{ 'is-active': idx === swiperCurrent }"></view>
				</view>
				<view v-if="imgList.length > 1" class="media-index">{{ swiperCurrent + 1 }}/{{ imgList.length }}</view>
			</view>
			<view v-else class="media-empty">{{ loading ? '加载中...' : '暂无图片' }}</view>

			<view class="note-body">
				<view class="note-title">{{ imgInfo.title }}</view>
				<view class="note-content" v-if="imgInfo.content && imgInfo.content !== imgInfo.title">{{ imgInfo.content }}</view>
				<view class="note-tags" v-if="imgInfo.tagList && imgInfo.tagList.length">
					<view class="note-tag" v-for="(tag, index) in imgInfo.tagList" :key="index"
						@click="onTapTag(index)">#{{ tagText(tag) }}</view>
				</view>
				<view class="note-meta">{{ imgInfo.time }} · {{ imgInfo.viewCount || 0 }}浏览</view>
			</view>

			<view class="comment-section">
				<view class="comment-head">
					{{ commentCount > 0 ? ('共' + commentCount + '条评论') : '还没有评论' }}
				</view>
				<view class="comment-composer" @click="active">
					<image class="comment-composer-avatar" :src="myAvatar" mode="aspectFill"></image>
					<view class="comment-composer-input">说点什么...</view>
				</view>
				<comment v-if="noteId" :mid="noteId" @getComment="getComment" @addAgree="addAgree"
					@scrollTop="getScrollTop" @cancelAgreeComment="cancelAgreeComment" :val="val" :parentId="parentId"
					:comArr="comArr" :commentInfo="commentInfo" :seed="commentReload" :currentUid="imgInfo.uid" @delComment="delComment">
				</comment>
			</view>
			<view class="scroll-pad"></view>

		<view class="detail-footer" :class="{ 'is-hidden': fn, 'is-emoji': useful_flag }">
			<view v-if="!useful_flag" class="footer-bar">
				<view class="footer-input" @click="active">说点什么...</view>
				<view class="footer-acts">
					<view class="footer-act" @click="onTapLike">
						<tui-icon :name="imgInfo.isLike ? 'like-fill' : 'like'" :size="22"
							:color="imgInfo.isLike ? '#ff2442' : '#111827'"></tui-icon>
						<text>{{ imgInfo.likeCount > 0 ? imgInfo.likeCount : '点赞' }}</text>
					</view>
					<view class="footer-act" @click="onTapCollect">
						<tui-icon :name="imgInfo.isCollection ? 'star-fill' : 'star'" :size="22"
							:color="imgInfo.isCollection ? '#f7ba1e' : '#111827'"></tui-icon>
						<text>{{ imgInfo.collectionCount > 0 ? imgInfo.collectionCount : '收藏' }}</text>
					</view>
					<view class="footer-act" @click="active">
						<tui-icon name="message" :size="22" color="#111827"></tui-icon>
						<text>{{ commentCount > 0 ? commentCount : '评论' }}</text>
					</view>
				</view>
			</view>
			<input-emoji v-else :useful_flag="useful_flag" :cursor="cursor" @addCommentWithEmoji="addCommentWithEmoji"
				:placeholder="placeholder">
			</input-emoji>
		</view>

		<!-- 蒙板 -->
		<view class="shade" v-show="show" @click="close"></view>

	</view>
</template>

<script>
	import Comment from "@/components/comment.vue"
	import InputEmoji from "@/components/inputEmoji.vue"
	import {
		getOne,
		deleteImgs,
		pinnedNote
	} from '@/api/imgDetail.js'
	import {
		addComment
	} from "@/api/comment.js"
	import {
		isCollectImgToAlbum
	} from "@/api/album.js"
	import {
		agree,
		isAgree,
		cancelAgree,
		cancelCollection
	} from "@/api/agreeCollect.js"
	import {
		isFollow,
		followUser,
		clearFollow
	} from "@/api/follow.js"
	import {
		timeAgo
	} from "@/utils/webUtils.js"
	import {
		openUser,
		ensureLogin,
		currentUid,
		emitNoteDeleted
	} from '@/utils/noteNav.js'
	import {
		mapNoteMedia,
		mediaUrl
	} from '@/utils/upload.js'
	export default {
		components: {
			Comment,
			InputEmoji
		},
		data() {
			return {
				noteId: '',
				imgList: [],
				imgInfo: {},
				loading: true,
				loadError: false,
				count: 0,
				album: {},
				content: '',
				comment: {},

				placeholder: '说点什么...',
				val: 0,
				parentId: '',
				comArr: [],
				isCollection: false,
				userIsLike: false,
				T: false,
				isCurrentUser: false,
				swiperCurrent: 0,
				swiperHeight: 1000,

				//
				useful_flag: false,
				cursor: false,
				show: false,

				fn: false,

				//
				commentInfo: {},
				commentReload: 0,

				//滚动
				scrollTop: 0,
				old: {
					scrollTop: 0
				}
			}
		},
		computed: {
			isVideo() {
				const t = String((this.imgInfo && this.imgInfo.noteType) || '')
				return t === '2'
			},
			videoSrc() {
				const urls = this.imgList || []
				const hit = urls.find(u => /\.(mp4|mov|webm)(\?|$)/i.test(String(u || '')))
				return hit || this.imgInfo.videoUrl || ''
			},
			coverSrc() {
				return this.imgInfo.noteCover || (this.imgList && this.imgList[0]) || ''
			},
			commentCount() {
				return Number((this.imgInfo && this.imgInfo.commentCount) || 0)
			},
			myAvatar() {
				const me = uni.getStorageSync('userInfo') || {}
				return me.avatar ? mediaUrl(me.avatar) : '/static/logo.png'
			},
			mediaStyle() {
				return 'height:' + this.swiperHeight + 'rpx;'
			},
			mediaImgStyle() {
				return 'width:100%;height:' + this.swiperHeight + 'rpx;'
			}
		},
		onLoad(option) {
			this.noteId = (option && (option.mid || option.nid || option.noteId)) || ''
			this.imgInfo = Object.assign({}, this.imgInfo, { id: this.noteId })
			if (option && option.cid != null) {
				this.comArr = [option.cid, option.rid]
			}
			this.getOne()
		},

		onReachBottom() {
			this.val = Math.random()
		},
		onBackPress(options) {
			/**
			 * 由于 uni.navigateBack() 同样会触发 onBackPress 函数。
			 * 因此在 onBackPress 中直接调用 uni.navigateBack() 并始终返回 true 会引发死循环。
			 * 此时，需要根据onBackPress的回调对象中的from值来做处理，当来源是'navigateBack'时，返回 false 。
			 */
			if (options.from === 'navigateBack') {
				return false;
			}
			this.back();
			return true;
		},
		onShareAppMessage() {
			const id = this.noteId || (this.imgInfo && this.imgInfo.id) || ''
			return {
				title: (this.imgInfo && this.imgInfo.title) || '来因笔记',
				path: '/pages/main/main?mid=' + id,
				imageUrl: this.coverSrc || '/static/logo.png'
			}
		},
		onShareTimeline() {
			const id = this.noteId || (this.imgInfo && this.imgInfo.id) || ''
			return {
				title: (this.imgInfo && this.imgInfo.title) || '来因笔记',
				query: 'mid=' + id,
				imageUrl: this.coverSrc || '/static/logo.png'
			}
		},
		methods: {
			onSwiperChange(e) {
				this.swiperCurrent = (e.detail && e.detail.current) || 0
			},
			toggleFollow() {
				if (this.T) {
					this.clearFollow(this.imgInfo.uid)
				} else {
					this.follow(this.imgInfo.uid)
				}
			},
			goAuthor() {
				this.getUserInfo(this.imgInfo.uid)
			},
			onTapTag(index) {
				const tag = (this.imgInfo.tagList || [])[index]
				if (tag) this.toTagList(tag.id)
			},
			onTapLike() {
				if (this.imgInfo.isLike) {
					this.cancelAgreeImg()
				} else {
					this.agreeImg()
				}
			},
			onTapCollect() {
				if (this.imgInfo.isCollection) {
					this.cancelCollect()
				} else {
					this.saveImgToAlbum()
				}
			},
			reloadNote() {
				this.getOne()
			},
			tagText(tag) {
				const raw = (tag && (tag.title || tag.name || tag.label)) || tag || ''
				return String(raw).replace(/^#/, '')
			},
			active() {
				if (!ensureLogin()) return
				this.useful_flag = true
				this.cursor = true
				this.show = true
			},

			close() {
				this.useful_flag = false
				this.show = false
				this.placeholder = '说点什么...'
				this.comment = {}

			},

			addCommentWithEmoji(content) {
				this.useful_flag = false
				this.show = false
				this.content = content
				this.addComment()
			},

			scroll(e) {
				this.old.scrollTop = e.detail.scrollTop
			},

			getScrollTop(top) {
				this.scrollTop = this.old.scrollTop
				this.$nextTick(function() {
					this.scrollTop = top
				});
			},

			delComment(flag) {
				this.fn = flag
			},

			back() {
				//测试返回上一页面传递参数
				//    let currentTab = this.currentTab

				// // 1. 获取当前页面栈实例（此时最后一个元素为当前页）
				//let pages = getCurrentPages()

				// // 2. 上一页面实例
				// // 注意是length长度，所以要想得到上一页面的实例需要 -2
				// // 若要返回上上页面的实例就 -3，以此类推
				// let prevPage = pages[pages.length - 2]

				// // 3. 给上一页面实例绑定getValue()方法和参数（注意是$vm）
				// prevPage.$vm.getValue(currentTab)


				let pages = getCurrentPages()

				//返回上一页面部分
				if (this.isCollection) {
					uni.navigateBack({
						delta: pages.length
					})
				} else {
					uni.navigateBack({
						delta: 1
					})
				}


			},
			//-------------------关注部分-------------------
			isFollow() {
				if (!currentUid()) return
				isFollow({
					followerId: this.imgInfo.uid
				}).then(res => {
					this.T = !!res.data
				})
			},
			follow(fid) {
				if (!ensureLogin()) return
				followUser({
					followerId: fid
				}).then(() => {
					this.T = true
				})
			},
			clearFollow(fid) {
				if (!ensureLogin()) return
				clearFollow({
					followerId: fid
				}).then(() => {
					this.T = false
				})
			},

			//----------------------点赞部分-----------------
			isAgree() {
				if (!currentUid()) return
				isAgree({
					uid: currentUid(),
					type: 1,
					likeOrCollectionId: this.imgInfo.id,
					publishUid: this.imgInfo.uid
				}).then(res => {
					this.$set(this.imgInfo, 'isLike', !!res.data)
				})
			},
			agreeImg() {
				if (!ensureLogin()) return
				agree({
					uid: currentUid(),
					type: 1,
					likeOrCollectionId: this.imgInfo.id,
					publishUid: this.imgInfo.uid
				}).then(() => {
					this.$set(this.imgInfo, 'isLike', true)
					this.imgInfo.likeCount = this.imgInfo.likeCount * 1 + 1
				})
			},

			addAgree(comment) {

				let data = {}
				data.uid = uni.getStorageSync("userInfo").id
				data.type = 0
				data.likeOrCollectionId = comment.id
				data.publishUid = comment.uid
				agree(data).then()
			},

			cancelAgreeImg() {
				if (!ensureLogin()) return
				cancelAgree({
					uid: currentUid(),
					likeOrCollectionId: this.imgInfo.id,
					publishUid: this.imgInfo.uid,
					type: 1
				}).then(() => {
					this.$set(this.imgInfo, 'isLike', false)
					this.imgInfo.likeCount = Math.max(0, this.imgInfo.likeCount * 1 - 1)
				})
			},

			cancelAgreeComment(comment) {
				let data = {}
				data.uid = uni.getStorageSync("userInfo").id
				data.likeOrCollectionId = comment.id
				data.publishUid = comment.uid
				data.type = 0
				cancelAgree(data).then()
			},

			cancelCollect() {
				if (this.imgInfo.uid == currentUid()) return
				if (!ensureLogin()) return
				cancelCollection({
					uid: currentUid(),
					likeOrCollectionId: this.imgInfo.id,
					publishUid: this.imgInfo.uid
				}).then(() => {
					this.isCollection = false
					this.$set(this.imgInfo, 'isCollection', false)
					this.imgInfo.collectionCount = Math.max(0, this.imgInfo.collectionCount * 1 - 1)
				})
			},


			isCollectImgToAlbum() {
				if (!currentUid() || !this.imgInfo.id) return
				isCollectImgToAlbum({
					nid: this.imgInfo.id
				}).then(res => {
					const collected = !!res.data
					this.isCollection = collected
					this.$set(this.imgInfo, 'isCollection', collected)
				}).catch(() => {})
			},

			//-----------------------------------预览图片----------------
			previewImgae(index) {
				const urls = this.imgList.length ? this.imgList : (this.imgInfo.imgsUrl || [])
				uni.previewImage({
					current: index,
					urls
				})
			},
			getOne() {
				if (!this.noteId) {
					this.loading = false
					this.loadError = true
					return
				}
				this.loading = true
				this.loadError = false
				getOne({
					noteId: this.noteId
				}).then(res => {
					this.loading = false
					if (!res || res.code !== 200 || !res.data) {
						this.loadError = true
						return
					}
					this.imgInfo = mapNoteMedia(res.data)
					this.noteId = String(this.imgInfo.id || this.noteId || '')
					const t = res.data.time
					let ts = typeof t === 'number' ? t : new Date(t).getTime()
					if (!ts || isNaN(ts)) ts = Date.now()
					this.imgInfo.time = timeAgo(ts)
					this.imgList = this.imgInfo.imgsUrl || []
					this.count = res.data.count
					this.album = res.data.album
					this.isCollection = !!this.imgInfo.isCollection

					this.isFollow()
					this.isAgree()
					this.isCollectImgToAlbum()
					if (this.imgInfo.uid == currentUid()) {
						this.isCurrentUser = true
					}
				}).catch(() => {
					this.loading = false
					this.loadError = true
				})
			},
			loadData() {
				this.val = Math.random()
			},

			getComment(comment) {
				this.comment = comment

				//第二种方案
				this.placeholder = '回复' + this.comment.username + ':'
				this.active()
			},

			addComment() {
				const userInfo = uni.getStorageSync("userInfo") || {}
				if (!userInfo.id) {
					ensureLogin()
					return
				}
				const commentInfo = {
					content: this.content,
					nid: this.imgInfo.id || this.noteId,
					noteUid: this.imgInfo.uid
				}
				if (this.comment && this.comment.id) {
					commentInfo.level = 2
					commentInfo.replyId = this.comment.id
					commentInfo.replyUid = this.comment.uid
					commentInfo.pid = (this.comment.pid && String(this.comment.pid) !== '0') ? this.comment.pid : this.comment.id
				} else {
					commentInfo.pid = '0'
					commentInfo.replyId = '0'
					commentInfo.replyUid = '0'
					commentInfo.level = 1
				}
				addComment(commentInfo).then(res => {
					if (!res || res.code !== 200) {
						uni.showToast({
							title: (res && (res.message || res.msg)) || '评论失败',
							icon: 'none'
						})
						return
					}
					this.content = ''
					this.comment = {}
					this.parentId = commentInfo.pid
					this.placeholder = "说点什么..."
					this.imgInfo.commentCount = Number(this.imgInfo.commentCount || 0) + 1
					this.commentReload = Date.now()
				})
			},
			getUserInfo(uid) {
				openUser(uid)
			},

			saveImgToAlbum() {
				if (!ensureLogin()) return
				if (this.imgInfo.uid == currentUid()) {
					uni.showToast({
						title: "自己不能收藏",
						icon: "none"
					});
					return
				}
				uni.navigateTo({
					url: '/pages/addalbum/addalbum?mid=' + this.imgInfo.id
				})
			},

			openMoreMenu() {
				const items = this.isCurrentUser
					? [this.pinText(), '编辑', '删除', '复制链接']
					: ['复制链接']
				uni.showActionSheet({
					itemList: items,
					success: (res) => {
						const text = items[res.tapIndex]
						if (text === '置顶' || text === '取消置顶') {
							this.togglePinned()
						} else if (text === '编辑') {
							this.editNote()
						} else if (text === '删除') {
							this.deleteNote()
						} else if (text === '复制链接') {
							this.copyNoteLink()
						}
					}
				})
			},
			pinText() {
				const p = this.imgInfo && this.imgInfo.pinned
				return (p === 1 || p === '1') ? '取消置顶' : '置顶'
			},
			togglePinned() {
				if (!ensureLogin()) return
				const id = this.imgInfo.id || this.noteId
				pinnedNote(id).then(res => {
					if (res && res.code === 200) {
						const cur = this.imgInfo.pinned
						this.$set(this.imgInfo, 'pinned', (cur === 1 || cur === '1') ? '0' : '1')
						uni.showToast({
							title: this.imgInfo.pinned === '1' ? '已置顶' : '已取消置顶',
							icon: 'none'
						})
					} else {
						uni.showToast({
							title: (res && (res.message || res.msg)) || '最多只能置顶3个笔记',
							icon: 'none'
						})
					}
				}).catch(() => {
					uni.showToast({
						title: '最多只能置顶3个笔记',
						icon: 'none'
					})
				})
			},
			editNote() {
				uni.navigateTo({
					url: '/pages/push/push?mid=' + (this.imgInfo.id || this.noteId) + '&type=update'
				})
			},
			deleteNote() {
				uni.showModal({
					title: '提示',
					content: '确定删除这篇笔记？',
					success: (m) => {
						if (!m.confirm) return
						const id = this.imgInfo.id || this.noteId
						deleteImgs([id]).then(res => {
							if (!res || res.code !== 200) {
								uni.showToast({
									title: (res && (res.message || res.msg)) || '删除失败',
									icon: 'none'
								})
								return
							}
							uni.showToast({
								title: '删除成功',
								icon: 'none'
							})
							emitNoteDeleted(id)
							setTimeout(() => {
								uni.navigateBack({
									delta: 1
								})
							}, 400)
						})
					}
				})
			},
			copyNoteLink() {
				const id = this.imgInfo.id || this.noteId
				uni.setClipboardData({
					data: '/pages/main/main?mid=' + id,
					success: () => {
						uni.showToast({
							title: '链接已复制',
							icon: 'none'
						})
					}
				})
			},

			toTagList(tid) {
				uni.navigateTo({
					url: '/pages/tagImgList/tagImgList?tid=' + tid
				})
			}


		}

	}
</script>

<style scoped>
	@import url(./main.css);
</style>