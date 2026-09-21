<template>
	<view class="hs-nav-root">
		<view class="hs-nav" :class="{ 'is-fixed': isFixed }" :style="{ backgroundColor: background, zIndex: zIndex }">
			<view class="hs-nav__status" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="hs-nav__bar" :class="{ 'has-line': border }">
				<view class="hs-nav__left" :class="{ 'is-empty': !hasLeft }">
					<view v-if="showBack" class="hs-nav__btn" @click="goBack">
						<tui-icon name="arrowleft" size="22"></tui-icon>
					</view>
					<slot name="left"></slot>
				</view>
				<view v-if="title" class="hs-nav__title">{{ title }}</view>
				<view class="hs-nav__center" :class="{ 'is-wide': !hasLeft }">
					<slot v-if="!title" name="center"></slot>
				</view>
				<view class="hs-nav__right" :class="{ 'is-empty': !hasRight && !showBack }">
					<slot name="right"></slot>
				</view>
			</view>
		</view>
		<view v-if="isFixed && placeholder" class="hs-nav__holder" :style="{ height: navHeight + 'px' }"></view>
	</view>
</template>

<script>
	export default {
		name: 'HsNavBar',
		options: {
			multipleSlots: true,
			styleIsolation: 'shared'
		},
		emits: ['back', 'init'],
		props: {
			title: {
				type: String,
				default: ''
			},
			showBack: {
				type: Boolean,
				default: true
			},
			autoBack: {
				type: Boolean,
				default: true
			},
			isFixed: {
				type: Boolean,
				default: false
			},
			placeholder: {
				type: Boolean,
				default: true
			},
			border: {
				type: Boolean,
				default: true
			},
			background: {
				type: String,
				default: '#ffffff'
			},
			zIndex: {
				type: [Number, String],
				default: 996
			},
			hasRightSlot: {
				type: Boolean,
				default: false
			},
			fallback: {
				type: String,
				default: '/pages/index/index'
			}
		},
		data() {
			return {
				statusBarHeight: 0
			}
		},
		computed: {
			navHeight() {
				return (this.statusBarHeight || 0) + 44
			},
			hasRight() {
				return this.hasRightSlot || !!(this.$slots && this.$slots.right)
			},
			hasLeft() {
				return this.showBack || !!(this.$slots && this.$slots.left)
			}
		},
		created() {
			try {
				const info = uni.getSystemInfoSync()
				this.statusBarHeight = info.statusBarHeight || 0
			} catch (e) {
				this.statusBarHeight = 0
			}
			this.$emit('init', {
				height: this.navHeight,
				statusBarHeight: this.statusBarHeight
			})
		},
		methods: {
			goBack() {
				this.$emit('back')
				if (!this.autoBack) return
				uni.navigateBack({
					fail: () => {
						if (this.fallback) {
							uni.switchTab({
								url: this.fallback,
								fail: () => {
									uni.reLaunch({
										url: this.fallback
									})
								}
							})
						}
					}
				})
			}
		}
	}
</script>

<style scoped>
	.hs-nav-root {
		width: 100%;
	}

	.hs-nav {
		width: 100%;
		background: #fff;
		box-sizing: border-box;
	}

	.hs-nav.is-fixed {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
	}

	.hs-nav__status {
		width: 100%;
	}

	.hs-nav__bar {
		position: relative;
		height: 44px;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.hs-nav__bar.has-line {
		border-bottom: 1rpx solid #eeeeee;
	}

	.hs-nav__left,
	.hs-nav__right {
		position: relative;
		z-index: 2;
		height: 44px;
		min-width: 44px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.hs-nav__left {
		justify-content: flex-start;
	}

	.hs-nav__left.is-empty {
		min-width: 0;
		width: 0;
		overflow: hidden;
	}

	.hs-nav__right {
		justify-content: flex-end;
		padding-right: 8px;
	}

	.hs-nav__right.is-empty {
		min-width: 0;
		width: 0;
		padding: 0;
		overflow: hidden;
	}

	.hs-nav__left >>> .hs-nav-action,
	.hs-nav__right >>> .hs-nav-action {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hs-nav__btn {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hs-nav__title {
		position: absolute;
		left: 88rpx;
		right: 88rpx;
		text-align: center;
		font-size: 34rpx;
		font-weight: 600;
		color: #111827;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		pointer-events: none;
	}

	.hs-nav__center {
		flex: 1;
		height: 44px;
		min-width: 0;
		padding: 0 12rpx;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.hs-nav__center.is-wide {
		padding: 0 16rpx;
	}

	.hs-nav__holder {
		width: 100%;
	}
</style>
