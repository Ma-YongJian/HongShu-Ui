<template>
	<view class="note-card" @click="onClick">
		<view class="image-container">
			<image class="cover" :src="cover" mode="widthFix" :lazy-load="true" />
			<view v-if="isVideo" class="video-play">
				<tui-icon name="play" color="#ffffff" size="18"></tui-icon>
			</view>
		</view>
		<view class="title">{{ title }}</view>
		<view class="meta">
			<view class="user" @click.stop="onUser">
				<image class="avatar" :src="avatar" mode="aspectFill" />
				<text class="name">{{ username }}</text>
			</view>
			<view class="like">
				<tui-icon :name="liked ? 'like-fill' : 'like'" size="14" :color="liked ? '#ff2442' : '#909399'"></tui-icon>
				<text class="like-num">{{ likeText }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { mediaUrl } from '@/utils/upload.js'
	export default {
		name: 'HsNoteCard',
		props: {
			item: {
				type: Object,
				default: () => ({})
			}
		},
		computed: {
			cover() {
				const it = this.item || {}
				return mediaUrl(it.noteCover || it.image || it.cover)
			},
			title() {
				const it = this.item || {}
				return it.title || it.content || ''
			},
			avatar() {
				return mediaUrl((this.item || {}).avatar)
			},
			username() {
				return (this.item || {}).username || ''
			},
			liked() {
				const it = this.item || {}
				return !!(it.isLike || it.liked)
			},
			likeText() {
				const n = Number((this.item || {}).agreeCount || (this.item || {}).likeCount || 0)
				return n > 0 ? n : '赞'
			},
			isVideo() {
				const t = String((this.item || {}).noteType || (this.item || {}).notesType || '')
				return t === '2'
			}
		},
		methods: {
			onClick() {
				this.$emit('click', this.item)
			},
			onUser() {
				this.$emit('user', this.item)
			}
		}
	}
</script>

<style scoped>
	.note-card {
		background: #fff;
		border-radius: 20rpx;
		border: 1rpx solid #f0f0f0;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
		margin-bottom: 16rpx;
	}

	.image-container {
		position: relative;
		border-radius: 20rpx 20rpx 0 0;
		overflow: hidden;
		background: #f5f5f5;
	}

	.cover {
		display: block;
		width: 100%;
		max-height: 500rpx;
	}

	.video-play {
		position: absolute;
		right: 12rpx;
		top: 12rpx;
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.title {
		padding: 16rpx 16rpx 0;
		font-size: 30rpx;
		color: #16160e;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx;
	}

	.user {
		display: flex;
		align-items: center;
		min-width: 0;
		flex: 1;
	}

	.avatar {
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		background: #f3f4f6;
		flex-shrink: 0;
	}

	.name {
		margin-left: 8rpx;
		font-size: 23rpx;
		color: #16160e;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.like {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		margin-left: 12rpx;
	}

	.like-num {
		margin-left: 4rpx;
		font-size: 22rpx;
		color: #909399;
	}
</style>
