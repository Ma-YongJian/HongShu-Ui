<template>
	<!-- 发布表情的组件-->
	<view class="consult">

		<view :class="['keyboard', useful_flag ? 'keyboard-active' : '']">
			<view :class="['keyboard-tup', active_Up ? 'active-tup' : '']">
				<input v-model="value" :focus="cursor" :cursor="resStart" @keyboardheightchange.stop="openinput"
					@blur="cursorss" @confirm="startSearch" @input="change" />

				<view v-if="T" style="position: absolute; left: 80rpx; color: #878787;">{{ placeholder }}</view>
				<view class="imface">
					<tui-icon class="imface" name="imface" size="20" @click="openUseful(1)"></tui-icon>
				</view>

				<tui-button type="primary" height="60rpx" width="100rpx" :size="28" @click="addComment">发送</tui-button>
			</view>
			<!-- 表情 -->
			<view class="expression" v-if="useful_expression === 1">
				<scroll-view class="emojis_scroll" :scroll-x="false" :scroll-y="true">
					<view v-for="(item, index) in emojis" :key="index" class="emoji"
						@click="onChooseEmoji(index)">
						{{ item.emoji }}
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			useful_flag: Boolean,
			cursor: Boolean,
			placeholder: String,
		},
		data() {
			return {
				show: false,
				value: '',
				active_Up: false,
				resStart: 0, //input光标位置
				//useful_flag: false, //控制动画效果
				useful_expression: 0, //1默认表情,2常用语
				T: true,
				emojis: [{
						emoji: '😃'
					},
					{
						emoji: '🤣'
					}, //真机才能看见效果
					{
						emoji: '😁'
					},
					{
						emoji: '😆'
					},
					{
						emoji: '😅'
					}
				]
			}
		},
		watch: {
			useful_flag: {
				handler(newval, oldval) {
					this.show = newval
				}
			},
		},

		methods: {
			// 软键盘弹起，获取到焦点
			openinput(event) {
				// 解决软键盘遮挡input输入框
				this.active_Up = true //初始化
				if (event.detail.height != 0) {
					this.active_Up = true
				} else {
					this.active_Up = false
				}
				return false
			},


			// 失去焦点时获取当前光标的位置
			cursorss(event) {
				// this.active_Up = false
				// this.cursor = false; //取消聚焦
				this.resStart = event.target.cursor //保存光标位置
			},
			ChooseToLook(val) {
				// 返回获取从0到光标位置的字符串
				let str = this.value.substring(0, this.resStart)
				// 将表情插入指定位置
				this.value = this.value.replace(str, str + val)
				// 光标向后移动两位
				this.resStart += 2; //光标加2(表情是占两个位置)

			},
			onChooseEmoji(index) {
				const row = this.emojis[index]
				if (row && row.emoji) {
					this.ChooseToLook(row.emoji)
				}
			},
			change() {
				this.T = false
				if (this.value == '') {
					this.T = true
				}
			},
			close() {},
			// 打开常用语
			openUseful(e) {
				this.T = false
				this.useful_expression = e
			},
			// 软键盘按下确定的事件监听
			startSearch(e) {
				console.log(e)
			},
			addComment() {
				this.$emit('addCommentWithEmoji', this.value);
			},
		}
	}
</script>

<style lang="scss" scoped>
	.consult {
		background-color: #fff;
		width: 100%;

		.keyboard-active {
			bottom: 0 !important;
		}

		.keyboard {
			position: relative;
			width: 100%;
			background: #fff;

			.expression {
				height: 400rpx;
				background-color: #FAFAFA;

				.emojis_scroll {
					display: block;
					width: 100%;
					height: 400rpx;
					padding-left: 16rpx;
					box-sizing: border-box;
				}

				.emoji {
					display: inline-block;
					width: 90rpx;
					height: 90rpx;
					font-size: 56rpx;
					text-align: center;
					line-height: 90rpx;
				}
			}

			::v-deep .keyboard-tup {
				display: flex;
				align-items: center;
				padding: 12rpx 20rpx;
				padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
				box-sizing: border-box;

				input {
					flex: 1;
					min-width: 0;
					height: 68rpx;
					padding: 0 20rpx;
					box-sizing: border-box;
					border-radius: 34rpx;
					background: #f3f3f2;
				}

				.imface {
					margin-left: 12rpx;
					margin-right: 12rpx;
				}

				height: auto;
				background-color: #fff;
			}

			.active-tup {
				height: auto;
			}
		}
	}
</style>