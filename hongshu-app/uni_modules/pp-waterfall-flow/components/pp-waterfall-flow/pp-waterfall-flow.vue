<template>
	<view id="waterfall_flow" class="waterfall-flow" :style="{'--pad':padpx,'--gap':gappx,'--col':columns}">
		<view class="item" v-for="(item,index) in list" :key="index"
			:style="{'--mbt':mbtpx,'--br':brpx,'grid-row':`span ${item.rows?item.rows:colWidth}`}"
			@click="clickItem(item)">

			<view class="image-container">
				<waterfall-flow-image :image="item[imageKey]" imgMode="widthFix" :height="item.imageHeight"
					:index="index" :border-radius="imageBR" @finish="loadImage($event,item)"
					@click="clickImage(item)"></waterfall-flow-image>
				<view v-if="item.auditStatus === '0'" class="overlay">审核中</view>
				<view v-if="item.auditStatus === '2'" class="overlay not-passed">未通过⚠️</view>
				<view v-if="item.pinned === '1' && item.type === 1" class="top-wrapper">置顶️</view>
			</view>

			<view class="char" :style="{'--h':charSizeFn}" v-if="showChar && item.rows && item.showChar">
				<view class="card">

					<view class="cont">

						<view class="content">{{item.title}}
							<view class="card-nums">
								<tui-icon name="eye" size="15" style="color: floralwhite;"></tui-icon>
								{{item.viewCount}}
							</view>
						</view>
						<view class="userInfo">
							<view class="avatar-usrname">
								<image :src="item.avatar" :lazy-load="true" mode="aspectFill" class="avatar"></image>
								<view class="username">{{ item.username }}</view>
							</view>
							<view class="agreeCount">
								<tui-icon name="like" size="14" v-if="!item.isLike"></tui-icon>
								<tui-icon name="like-fill" size="14" v-else style="color: red;"></tui-icon>
								{{ item.likeCount }}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	const windowWidth = uni.getSystemInfoSync().windowWidth;
	export default {
		props: {
			value: Array,
			imageKey: {
				type: [String],
				default: 'noteCover'
			},
			padding: {
				type: [Number],
				default: 10
			},
			gap: {
				type: [Number],
				default: 10
			},
			columns: {
				type: [String, Number],
				default: 2
			},
			itemBR: {
				type: [String, Number],
				default: 20
			},
			imageBR: {
				type: [String],
				default: '20rpx 20rpx 0 0'
			},
			mbt: {
				type: [Number],
				default: 10
			},
			showChar: {
				type: [Boolean],
				default: true
			},
			charSize: {
				type: [Number],
				default: 140
			}
		},
		computed: {
			charSizeFn() {
				return this.showChar ? `${uni.upx2px(this.charSize)}px` : 0;
			},
			colWidth() {
				const gap = uni.upx2px(this.gap);
				const padding = uni.upx2px(this.padding);
				const result = Math.ceil(((this.fallWidth - gap * (this.columns + 1) - padding * 2) / this.columns) + uni
					.upx2px(parseFloat(this.mbt)));
				return result;
			},
			padpx() {
				return `${uni.upx2px(this.padding)}px`;
			},
			gappx() {
				return `${uni.upx2px(this.gap)}px`;
			},
			mbtpx() {
				return `${uni.upx2px(this.mbt)}px`;
			},
			brpx() {
				return `${uni.upx2px(this.itemBR)}px`;
			}
		},
		data() {
			return {
				list: [],
				fallWidth: windowWidth
			}
		},
		watch: {
			value: {
				deep: true,
				immediate: true,
				handler(newVal, oldVal) {
					if (newVal.length == 0) this.list = [];
					const newArr = newVal.slice(this.list.length, newVal.length);
					newArr.forEach(item => {
						if (typeof item.showChar == 'undefined') item.showChar = true;
					})
					this.list.push.apply(this.list, newArr);
				}
			}
		},
		mounted() {
			// #ifdef H5
			this.$nextTick(() => {
				this.waterfallWidth();
			})
			// #endif
			// #ifndef H5
			setTimeout(() => {
				this.waterfallWidth();
			}, 10)
			// #endif
		},
		methods: {
			waterfallWidth() {
				let that = this;
				const query = uni.createSelectorQuery().in(this);
				query.select('#waterfall_flow').boundingClientRect(data => {
					if (data.width) that.fallWidth = data.width;
				}).exec();
			},
			loadImage({
				e,
				index
			}, item) {
				const gap = uni.upx2px(this.gap);
				const padding = uni.upx2px(this.padding);
				const width = ((this.fallWidth - gap * (this.columns - 1) - padding * 2) / this.columns);
				const rate = e.detail.width / e.detail.height;
				const imageHeight = width / rate;
				const rows = +Math.ceil(imageHeight);
				const gridRow = rows + (this.showChar && item.showChar ? uni.upx2px(parseFloat(this.charSize)) : 0) + uni
					.upx2px(parseFloat(this.mbt));
				item.rows = gridRow;
				item.imageHeight = `${imageHeight}px`;
				// #ifdef VUE2
				this.$set(this.list, index, item);
				// #endif
			},
			clickImage(item) {
				this.$emit('clickImage', item);
			},
			clickItem(item) {
				this.$emit('clickItem', item);
			}
		}
	}
</script>
<style>
</style>
<style scoped lang="scss">
	.image-container {
		position: relative;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		font-size: 16px;
		z-index: 1;		/* 确保覆盖在图片上 */
	}

	.not-passed {
		background-color: rgba(255, 0, 0, 0.5);
	}

	.top-wrapper {
		position: absolute;
		left: 10px;
		top: 5px;
		z-index: 4;
		background: #ff2442;
		border-radius: 999px;
		font-weight: 500;
		color: #fff;
		line-height: 120%;
		font-size: 12px;
		padding: 5px 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.waterfall-flow {
		display: grid;
		grid-template-columns: repeat(var(--col), 1fr);
		grid-template-rows: repeat(auto-fill, 1px);
		grid-auto-rows: 1px;
		grid-column-gap: var(--gap);
		padding: 0 var(--pad);
	}

	.item {
		margin-bottom: var(--mbt);
		border-radius: var(--br);
		box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);
		background-color: #fff;
		overflow: hidden;
		font-size: 0;
		// 骗系统开启硬件加速
		transform: transition3d(0, 0, 0);

		.char {
			height: var(--h);
		}
	}

	// 图片下方内容扩展样式
	.char {
		padding: 0 10rpx;

		.card {
			margin: 30rpx 2rpx;
			box-sizing: border-box;
			break-inside: avoid;
			background-color: #fff;
			position: relative;
			border-radius: 8px;

			.card-nums {
				position: absolute;
				bottom: 140rpx;
				left: 265rpx;
				background-color: #7a7a7a;
				width: 80rpx;
				height: 35rpx;
				text-align: center;
				color: #fff;
				opacity: 0.7;
				// margin-right: 5px;
				border-radius: 20rpx;
				/* 添加圆角 */
				font-size: 24rpx;
			}

			.cont {
				margin-left: 5px;

				.content {
					width: 300rpx;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					font-size: 28rpx;
				}

				.userInfo {
					margin-top: 5px;
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-right: 5px;

					.avatar-usrname {
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding-bottom: 5px;

						.avatar {
							width: 50rpx;
							height: 50rpx;
							border-radius: 50%;
						}

						.username {
							color: #000000;
							font-size: 24rpx;
							margin-left: 2px;
						}
					}

					.agreeCount {
						color: #000000;
						font-size: 24rpx;
					}
				}
			}

		}

		.title {
			line-height: 48rpx;
			font-size: 30rpx;
			font-weight: 700;
			color: #222;
		}

		.desc {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			line-height: 36rpx;
			font-size: 24rpx;
			color: #666;
		}
	}
</style>