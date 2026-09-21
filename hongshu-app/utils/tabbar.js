export function messageTabIndex() {
	// App 中间发布按钮不占 list 下标；微信小程序发布是第 3 个 Tab
	// #ifdef APP-PLUS
	return 2
	// #endif
	// #ifndef APP-PLUS
	return 3
	// #endif
}
