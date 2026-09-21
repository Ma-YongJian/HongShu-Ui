<template>
	<view class="empty-state">
		<view class="empty-icon">
			<view class="empty-search-circle"></view>
			<view class="empty-search-handle"></view>
		</view>
		<text class="empty-title">{{ title }}</text>
		<text v-if="tip" class="empty-tip">{{ tip }}</text>
		<view v-if="action" class="empty-btn" @click="$emit('action')">{{ action }}</view>
	</view>
</template>

<script>
	export default {
		name: 'HsEmpty',
		props: {
			title: {
				type: String,
				default: '暂无内容'
			},
			tip: {
				type: String,
				default: ''
			},
			action: {
				type: String,
				default: ''
			}
		}
	}
</script>

<style scoped>
	.empty-state {
		padding: 120rpx 48rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.empty-icon {
		position: relative;
		width: 88rpx;
		height: 88rpx;
		margin-bottom: 24rpx;
	}

	.empty-search-circle {
		width: 56rpx;
		height: 56rpx;
		border: 6rpx solid rgba(61, 138, 245, 0.45);
		border-radius: 50%;
	}

	.empty-search-handle {
		position: absolute;
		right: 8rpx;
		bottom: 12rpx;
		width: 28rpx;
		height: 6rpx;
		background: rgba(61, 138, 245, 0.45);
		border-radius: 4rpx;
		transform: rotate(45deg);
	}

	.empty-title {
		font-size: 30rpx;
		color: #333;
		line-height: 1.4;
	}

	.empty-tip {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #999;
	}

	.empty-btn {
		margin-top: 28rpx;
		height: 64rpx;
		padding: 0 36rpx;
		line-height: 64rpx;
		border-radius: 32rpx;
		background: #3d8af5;
		color: #fff;
		font-size: 26rpx;
	}
</style>
