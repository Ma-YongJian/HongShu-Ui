<template>
	<view class="edit-page">
		<hs-nav-bar title="编辑资料"></hs-nav-bar>

		<view class="avatar-card">
			<view class="avatar-wrap" @click="chooseAvatar">
				<image :src="avatarSrc" mode="aspectFill"></image>
				<view class="camera">
					<tui-icon name="camera" size="16" color="#fff"></tui-icon>
				</view>
			</view>
			<view class="avatar-hint">点击更换头像</view>
		</view>

		<view class="cell-card">
			<view class="cell" @click="updateInfo(1)">
				<view class="cell-label">昵称</view>
				<view class="cell-value">{{ userInfo.username || '未设置' }}</view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
			<view class="cell" @click="updateInfo(2)">
				<view class="cell-label">性别</view>
				<view class="cell-value">{{ genderText }}</view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
			<view class="cell" @click="updateInfo(3)">
				<view class="cell-label">生日</view>
				<view class="cell-value">{{ userInfo.birthday || '未设置' }}</view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
			<view class="cell" @click="updateInfo(4)">
				<view class="cell-label">简介</view>
				<view class="cell-value">{{ userInfo.description || '介绍一下自己吧' }}</view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
			<view class="cell" @click="updateInfo(5)">
				<view class="cell-label">地区</view>
				<view class="cell-value">{{ userInfo.address || '未设置' }}</view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
			<view class="cell" @click="updateInfo(6)">
				<view class="cell-label">标签</view>
				<view class="cell-value">{{ userInfo.tags || '添加个人标签' }}</view>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
			<view class="cell cell-last" @click="chooseCover">
				<view class="cell-label">背景图</view>
				<image class="cover-thumb" :src="coverSrc" mode="aspectFill"></image>
				<tui-icon name="arrowright" size="18" color="#c4c4c4"></tui-icon>
			</view>
		</view>

		<tui-modal :show="sexShow" @click="updateSex" @cancel="hideSex" content="请选择性别" :button="radioSex"></tui-modal>
		<tui-datetime ref="dateTime" :type="type" :startYear="startYear" :endYear="endYear" :cancelColor="cancelColor"
			:color="color" :setDateTime="setDateTime" :unitTop="unitTop" :radius="radius" @confirm="changeBirthday">
		</tui-datetime>

		<view class="tui-mask-screen" :class="[showPickerStatus?'tui-mask-show':'']" @tap="hidePicker"></view>
		<view class="tui-picker-box" :class="[showPickerStatus?'tui-pickerbox-show':'']">
			<view class="picker-header tui-list-item">
				<view class="btn-cancle" @tap.stop="hidePicker">取消</view>
				<view class="btn-sure" @tap.stop="picker">确定</view>
			</view>
			<picker-view indicator-style="height: 50px;" class="picker-view" :value="value" @change="columnPicker">
				<picker-view-column>
					<view v-for="(item,index) in proviceArr" :key="index" class="item">{{item}}</view>
				</picker-view-column>
				<picker-view-column>
					<view v-for="(item,index) in cityArr" :key="index" class="item">{{item}}</view>
				</picker-view-column>
				<picker-view-column>
					<view v-for="(item,index) in districtArr" :key="index" class="item">{{item}}</view>
				</picker-view-column>
			</picker-view>
		</view>
	</view>
</template>

<script>
	import { getUserInfo, updateUser } from "@/api/user.js"
	import cityData from '@/utils/picker.city.js'
	import { mediaUrl, uploadImage } from '@/utils/upload.js'

	export default {
		data() {
			return {
				userInfo: {},
				uid: '',
				sexShow: false,
				radioSex: [{
					text: '男',
					type: 'primary',
				}, {
					text: '女',
					type: 'primary',
				}],
				type: 2,
				startYear: 1900,
				endYear: new Date().getFullYear(),
				cancelColor: '#888',
				color: '#3b82f6',
				setDateTime: '',
				unitTop: false,
				radius: false,
				proviceArr: [],
				cityArr: [],
				districtArr: [],
				value: [0, 0, 0],
				showPickerStatus: false,
				uploading: false
			}
		},
		computed: {
			avatarSrc() {
				return mediaUrl(this.userInfo.avatar)
			},
			coverSrc() {
				if (!this.userInfo.userCover) return '/static/images/toast/img_nodata.png'
				return mediaUrl(this.userInfo.userCover)
			},
			genderText() {
				const gender = this.userInfo.gender
				if (gender === 1 || gender === '1') return '男'
				if (gender === 0 || gender === '0') return '女'
				return '未设置'
			}
		},
		onLoad(options) {
			const cached = uni.getStorageSync("userInfo") || {}
			const queryId = options && options.userId && options.userId !== 'undefined' ? options.userId : ''
			this.uid = String(queryId || cached.id || '').trim()
			this.proviceArr = this.toArr(cityData);
			this.cityArr = this.toArr(cityData[0].children);
			this.districtArr = this.toArr(cityData[0].children[0].children)
		},
		onShow() {
			if (this.uid) {
				this.getUser(this.uid)
			}
		},
		methods: {
			toArr(object) {
				let arr = [];
				for (let i in object) {
					arr.push(object[i].text);
				}
				return arr;
			},
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
			getUser(uid) {
				getUserInfo({
					userId: uid
				}).then(res => {
					if (res.code === 200 && res.data) {
						this.userInfo = res.data
						uni.setStorageSync("userInfo", Object.assign({}, uni.getStorageSync("userInfo") || {}, res.data))
					}
				})
			},
			saveProfile(patch) {
				return updateUser(patch || {}).then(res => {
					if (res.code !== 200) {
						uni.showToast({
							title: res.message || '保存失败',
							icon: 'none'
						})
						return Promise.reject(res)
					}
					this.userInfo = Object.assign({}, this.userInfo, res.data || patch || {})
					uni.setStorageSync("userInfo", Object.assign({}, uni.getStorageSync("userInfo") || {}, this.userInfo))
					uni.showToast({
						title: '保存成功',
						icon: 'none'
					})
					return res
				})
			},
			chooseAvatar() {
				this.pickAndUpload('avatar')
			},
			chooseCover() {
				this.pickAndUpload('userCover')
			},
			pickAndUpload(field) {
				if (this.uploading) return
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed', 'original'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const filePath = res.tempFilePaths[0]
						this.uploading = true
						uni.showLoading({
							title: '上传中'
						})
						uploadImage(filePath).then((path) => {
							const patch = {}
							patch[field] = path
							return this.saveProfile(patch)
						}).catch((err) => {
							uni.showToast({
								title: (err && err.message) || '上传失败',
								icon: 'none'
							})
						}).then(() => {
							this.uploading = false
							uni.hideLoading()
						})
					}
				})
			},
			updateInfo(index) {
				if (index == 1 || index == 4 || index == 6) {
					uni.navigateTo({
						url: "/pages/user/info/updateInfo/updateInfo?type=" + index
					})
				} else if (index == 2) {
					this.sexShow = true
				} else if (index == 3) {
					this.setDateTime = this.userInfo.birthday || ''
					this.$refs.dateTime && this.$refs.dateTime.show();
				} else {
					this.showPicker()
				}
			},
			updateSex(e) {
				this.saveProfile({
					gender: e.index == 0 ? '1' : '0'
				}).then(() => {
					this.hideSex();
				})
			},
			hideSex() {
				this.sexShow = false;
			},
			changeBirthday(e) {
				this.saveProfile({
					birthday: e.result
				})
			},
			columnPicker(e) {
				let value = e.detail.value;
				if (this.value[0] !== value[0]) {
					this.cityArr = this.toArr(cityData[value[0]].children);
					this.districtArr = this.toArr(cityData[value[0]].children[0].children);
					this.value = [value[0], 0, 0]
				} else if (this.value[1] !== value[1]) {
					this.districtArr = this.toArr(cityData[value[0]].children[value[1]].children);
					this.value = [value[0], value[1], 0]
				} else {
					this.value = value
				}
			},
			picker() {
				let value = this.value;
				if (cityData.length > 0) {
					let provice = cityData[value[0]].text;
					let city = cityData[value[0]].children[value[1]].text;
					let district = cityData[value[0]].children[value[1]].children[value[2]].text;
					this.saveProfile({
						address: provice + ' ' + city + ' ' + district
					}).then(() => {
						this.showPickerStatus = false
					})
				}
			},
			showPicker() {
				this.showPickerStatus = true
			},
			hidePicker() {
				this.showPickerStatus = false
			}
		}
	}
</script>

<style scoped>
	@import url(./info.css);
</style>
