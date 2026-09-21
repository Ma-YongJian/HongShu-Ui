<script>
	import { startPublish } from '@/utils/publish.js'
	export default {
		onLaunch: function() {
			if (typeof plus !== 'undefined' && plus.navigator) {
				plus.navigator.closeSplashscreen();
			}
			this.bindMidButton()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			bindMidButton() {
				if (typeof uni.onTabBarMidButtonTap !== 'function') return
				uni.onTabBarMidButtonTap(() => {
					startPublish()
				})
			}
		}
	}
</script>

<style>
	@import url("/static/style/app-theme.css");
</style>
