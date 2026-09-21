import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import EvanEmoji from '@/uni_modules/evan-emoji/utils/index.js'
import { rememberTab } from '@/utils/publish.js'

Vue.config.productionTip = false
Vue.use(EvanEmoji)
Vue.mixin({
	onShow() {
		try {
			const pages = getCurrentPages()
			const cur = pages[pages.length - 1]
			if (cur && cur.route) {
				rememberTab(cur.route)
			}
		} catch (e) {}
	}
})
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif
