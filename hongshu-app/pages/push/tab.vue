<template>
	<view class="publish-tab"></view>
</template>

<script>
	import { tokenUtil } from '@/utils/token.js'
	import { lastTabPath, goLogin, goPushPage } from '@/utils/publish.js'

	export default {
		data() {
			return {
				busy: false
			}
		},
		onShow() {
			if (this.busy) return
			this.busy = true
			const last = lastTabPath()
			uni.switchTab({
				url: last,
				complete: () => {
					setTimeout(() => {
						this.busy = false
						if (!tokenUtil.get()) {
							goLogin()
							return
						}
						goPushPage()
					}, 80)
				}
			})
		}
	}
</script>

<style>
	.publish-tab {
		width: 100%;
		min-height: 100%;
		background: #ffffff;
	}
</style>
