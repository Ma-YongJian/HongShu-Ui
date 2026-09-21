<template>
	<view class="push-page">
		<view class="nav-wrap">
			<hs-nav-bar :title="isUpdate ? '编辑笔记' : '发布笔记'" :autoBack="false" @back="back"></hs-nav-bar>
		</view>

		<scroll-view scroll-y class="main">
			<view class="editor">
				<scroll-view scroll-x class="media-row" enable-flex>
					<view class="media-inner">
						<view class="media-slot" v-for="(item, index) in imgList" :key="index">
							<image class="media-img" :src="displayUrl(item)" mode="aspectFill" @click="previewImage(index)"></image>
							<view class="media-close" @click.stop="removeImage(index)">
								<tui-icon name="close" :size="12" color="#fff"></tui-icon>
							</view>
							<view v-if="coverIndex === index" class="cover-badge">封面</view>
							<view v-else class="cover-set" @click.stop="setCover(index)">设为封面</view>
						</view>
						<view class="media-add" v-if="imgList.length < 9" @click="chooseImg">
							<tui-icon name="plus" :size="28" color="#c4c4c4"></tui-icon>
						</view>
					</view>
				</scroll-view>
				<view class="media-tip">{{ imgList.length }}/9</view>

				<input class="title-input" type="text" maxlength="20" placeholder="填写标题会有更多赞哦"
					v-model="title" />
				<textarea class="content-input" maxlength="300" placeholder="添加正文，让更多人看见你"
					v-model="content"></textarea>
			</view>

			<view class="cell-card">
				<view class="cell" @click="showCategory">
					<view class="cell-label">选择分类</view>
					<view class="cell-value" :class="{ placeholder: !categoryStr }">{{ categoryStr || '请选择' }}</view>
					<tui-icon name="arrowright" :size="18" color="#c4c4c4"></tui-icon>
				</view>
				<view class="cell" @click="showTagPopup">
					<view class="cell-label">添加标签</view>
					<view class="cell-value" :class="{ placeholder: !tagcontent }">{{ tagcontent || '最多 5 个' }}</view>
					<tui-icon name="arrowright" :size="18" color="#c4c4c4"></tui-icon>
				</view>
				<view class="cell cell-last" @click="showAlbumPopup">
					<view class="cell-label">存入专辑</view>
					<view class="cell-value" :class="{ placeholder: !albumTitle }">{{ albumTitle || '可选' }}</view>
					<tui-icon name="arrowright" :size="18" color="#c4c4c4"></tui-icon>
				</view>
			</view>
			<view class="bottom-space"></view>
		</scroll-view>

		<view class="footer">
			<view class="publish-btn" :class="{ disabled: submitting }" @click="publish">
				{{ submitting ? '发布中...' : (isUpdate ? '保存' : '发布') }}
			</view>
		</view>

		<tui-toast ref="toast"></tui-toast>
		<tui-modal :show="modal" @click="handleClick" @cancel="hide" content="退出后当前编辑内容将不会保存" color="#333"
			:size="32" shape="circle" :button="modalBtns"></tui-modal>

		<tui-bottom-popup :zIndex="1002" :maskZIndex="1001" :show="popupShow" @close="popup">
			<view class="cat-sheet">
				<view class="sheet-title">选择分类</view>
				<scroll-view scroll-y class="cat-scroll">
					<view v-if="!categoryPickerList.length" class="empty-child">暂无分类</view>
					<view class="cat-grid">
						<view class="cat-grid__item" v-for="(cat, idx) in categoryPickerList" :key="idx"
							:class="{ on: cid == cat.id }" @click="onChooseCategory(idx)">
							{{ cat.title }}
						</view>
					</view>
				</scroll-view>
			</view>
		</tui-bottom-popup>

		<tui-bottom-popup :zIndex="1004" :maskZIndex="1003" :show="tagPopupShow" @close="closeTagPopup">
			<view class="sheet">
				<view class="sheet-title">添加标签</view>
				<view class="chip-list">
					<view class="chip chip-on" v-for="(item, index) in tagList" :key="index">
						{{ item }}
						<view class="chip-close" @click="removeTag(index)">×</view>
					</view>
				</view>
				<view class="tag-input-row">
					<input class="tag-input" maxlength="12" placeholder="输入标签后回车" v-model="tagInput"
						@confirm="addTag" />
					<view class="tag-add-btn" @click="addTag">添加</view>
				</view>
				<view class="hot-title" v-if="hotTags.length">热门推荐</view>
				<view class="chip-list">
					<view class="chip" v-for="(item, index) in hotTags" :key="index" @click="onAddHotTag(index)">
						{{ item }}
					</view>
				</view>
			</view>
		</tui-bottom-popup>

		<tui-bottom-popup :zIndex="1006" :maskZIndex="1005" :show="albumPopupShow" @close="closeAlbumPopup">
			<view class="sheet">
				<view class="sheet-title">存入专辑</view>
				<view class="album-item" :class="{ on: !albumId }" @click="clearAlbum">
					不存入专辑
				</view>
				<view class="album-item" v-for="(item, index) in albumList" :key="index"
					:class="{ on: albumId == item.id }" @click="onSelectAlbum(index)">
					<image class="album-cover" :src="item.coverUrl" mode="aspectFill"></image>
					<view class="album-name">{{ item.title }}</view>
				</view>
				<view class="empty-child" v-if="!albumList.length">暂无专辑，可在「我的」中创建</view>
			</view>
		</tui-bottom-popup>
	</view>
</template>

<script>
	import { getCategory } from "@/api/category.js"
	import { getOne } from '@/api/imgDetail.js'
	import { getAllTag } from "@/api/tag.js"
	import { getAllAlbum } from "@/api/album.js"
	import { tokenUtil } from "@/utils/token.js"
	import { mediaUrl, uploadLocalImages, submitNote } from "@/utils/upload.js"

	function parseStore(key, fallback) {
		try {
			const raw = uni.getStorageSync(key)
			if (!raw) return fallback
			return typeof raw === 'string' ? JSON.parse(raw) : raw
		} catch (e) {
			return fallback
		}
	}

	export default {
		data() {
			return {
				statusBarHeight: 0,
				popupShow: false,
				tagPopupShow: false,
				albumPopupShow: false,
				imgList: [],
				title: '',
				content: '',
				cid: '',
				cpid: '',
				categoryStr: '',
				coverIndex: 0,
				tagList: [],
				tagInput: '',
				hotTags: [],
				categoryTree: [],
				categoryPickerList: [],
				modal: false,
				modalBtns: [{
					text: '取消',
					type: 'primary',
					plain: true
				}, {
					text: '确定',
					type: 'primary',
					plain: false
				}],
				isUpdate: false,
				noteId: '',
				submitting: false,
				albumId: '',
				albumTitle: '',
				albumList: []
			}
		},
		computed: {
			tagcontent() {
				return (this.tagList || []).join(' ')
			}
		},
		onLoad(option) {
			const sys = uni.getSystemInfoSync()
			this.statusBarHeight = sys.statusBarHeight || 0
			this.isUpdate = option.type === 'update' && !!option.mid
			this.noteId = option.mid || ''
			if (this.isUpdate) {
				this.loadNote(this.noteId)
			} else {
				const saved = parseStore('imgList', [])
				this.imgList = Array.isArray(saved) ? saved : []
				const tags = parseStore('tags', [])
				this.tagList = this.normalizeTags(tags)
			}
			this.loadHotTags()
		},
		onShow() {
			if (!this.isUpdate) {
				const tags = parseStore('tags', [])
				if (tags && tags.length) {
					this.tagList = this.normalizeTags(tags)
				}
			}
		},
		onBackPress(options) {
			if (options.from === 'navigateBack') {
				return false
			}
			this.back()
			return true
		},
		methods: {
			displayUrl(path) {
				return mediaUrl(path)
			},
			normalizeTags(list) {
				if (!Array.isArray(list)) return []
				return list.map(item => {
					if (!item) return ''
					if (typeof item === 'string') return item
					return item.title || item.name || ''
				}).filter(Boolean)
			},
			toast(title) {
				this.$refs.toast && this.$refs.toast.show({ title })
			},
			back() {
				this.modal = true
			},
			handleClick(e) {
				if (e.index == 1) {
					this.clearDraft()
					uni.switchTab({
						url: "/pages/index/index"
					})
				}
				this.hide()
			},
			hide() {
				this.modal = false
			},
			clearDraft() {
				uni.removeStorageSync("imgList")
				uni.removeStorageSync("tags")
				uni.removeStorageSync("imgInfo")
			},
			persistImages() {
				uni.setStorageSync("imgList", JSON.stringify(this.imgList))
			},
			showCategory() {
				const open = () => {
					this.popupShow = true
				}
				if (this.categoryPickerList.length) {
					open()
					return
				}
				this.loadCategoryTree().then(open).catch(() => {
					this.toast('分类加载失败')
				})
			},
			loadCategoryTree() {
				return getCategory().then(res => {
					const tree = (res && res.data) || []
					this.categoryTree = Array.isArray(tree) ? tree : []
					this.categoryPickerList = this.buildCategoryPickerList(this.categoryTree)
					return this.categoryPickerList
				})
			},
			buildCategoryPickerList(tree) {
				const leaves = []
				const walk = (nodes, parent) => {
					(nodes || []).forEach(node => {
						if (!node) return
						const children = node.children || []
						if (children.length) {
							walk(children, node)
							return
						}
						leaves.push({
							id: node.id,
							title: node.title || node.name || '',
							pid: (parent && parent.id) || (this.isRootPid(node.pid) ? node.id : node.pid),
							parentTitle: parent ? (parent.title || parent.name || '') : ''
						})
					})
				}
				walk(tree, null)
				return leaves.length ? leaves : (tree || []).map(node => ({
					id: node.id,
					title: node.title || node.name || '',
					pid: this.isRootPid(node.pid) ? node.id : node.pid,
					parentTitle: ''
				}))
			},
			isRootPid(pid) {
				return pid === undefined || pid === null || pid === '' || String(pid) === '0' || String(pid) === '-1'
			},
			chooseCategory(cat) {
				if (!cat || cat.id === undefined || cat.id === null || cat.id === '') return
				this.cid = String(cat.id)
				this.cpid = this.isRootPid(cat.pid) ? String(cat.id) : String(cat.pid)
				this.categoryStr = cat.parentTitle ? (cat.parentTitle + ' / ' + cat.title) : cat.title
				this.popupShow = false
			},
			chooseImg() {
				if (this.imgList.length >= 9) {
					this.toast('最多 9 张图片')
					return
				}
				const maxCount = 9 - this.imgList.length
				uni.chooseImage({
					count: maxCount,
					sizeType: ['compressed', 'original'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.imgList = this.imgList.concat(res.tempFilePaths || [])
						this.persistImages()
					}
				})
			},
			removeImage(index) {
				this.imgList.splice(index, 1)
				if (this.coverIndex >= this.imgList.length) {
					this.coverIndex = 0
				}
				this.persistImages()
			},
			setCover(index) {
				this.coverIndex = index
			},
			previewImage(index) {
				uni.previewImage({
					current: index,
					urls: this.imgList.map(item => this.displayUrl(item))
				})
			},
			popup() {
				this.popupShow = false
			},
			closeTagPopup() {
				this.tagPopupShow = false
			},
			closeAlbumPopup() {
				this.albumPopupShow = false
			},
			onChooseCategory(idx) {
				this.chooseCategory(this.categoryPickerList[idx])
			},
			onAddHotTag(index) {
				this.addHotTag(this.hotTags[index])
			},
			onSelectAlbum(index) {
				const item = this.albumList[index]
				if (!item) return
				this.selectAlbum(item.id, item.title)
			},
			clearAlbum() {
				this.selectAlbum('', '不存入专辑')
			},
			showTagPopup() {
				this.tagPopupShow = true
			},
			addTag() {
				const tag = (this.tagInput || '').trim()
				if (!tag) return
				if (this.tagList.length >= 5) {
					this.toast('最多支持 5 个标签')
					return
				}
				if (this.tagList.indexOf(tag) >= 0) {
					this.toast('标签已经存在')
					return
				}
				this.tagList.push(tag)
				this.tagInput = ''
				uni.setStorageSync('tags', JSON.stringify(this.tagList))
			},
			addHotTag(tag) {
				this.tagInput = tag
				this.addTag()
			},
			removeTag(index) {
				this.tagList.splice(index, 1)
				uni.setStorageSync('tags', JSON.stringify(this.tagList))
			},
			loadHotTags() {
				getAllTag(1, 10, { keyword: '' }).then(res => {
					const records = (res && res.data && res.data.records) || []
					this.hotTags = records.map(item => item.title).filter(Boolean)
				}).catch(() => {})
			},
			showAlbumPopup() {
				this.albumPopupShow = true
				const userInfo = uni.getStorageSync('userInfo') || {}
				getAllAlbum(1, 50, { userId: userInfo.id || tokenUtil.getUserId() }).then(res => {
					const records = (res && res.data && res.data.records) || []
					this.albumList = records.map(item => {
						item.coverUrl = mediaUrl(item.albumCover)
						return item
					})
				}).catch(() => {})
			},
			selectAlbum(id, title) {
				this.albumId = id
				this.albumTitle = title
				this.albumPopupShow = false
			},
			publish() {
				if (this.submitting) return
				if (!tokenUtil.get()) {
					this.toast('请先登录')
					return
				}
				if (!this.imgList.length) {
					this.toast('请至少添加一张图片')
					return
				}
				if (!String(this.title || '').trim()) {
					this.toast('请输入标题')
					return
				}
				if (!this.cid) {
					this.toast('请选择一个分类')
					return
				}
				this.submitting = true
				uni.showLoading({ title: '发布中...' })
				const ordered = this.imgList.slice()
				if (this.coverIndex > 0 && this.coverIndex < ordered.length) {
					const cover = ordered.splice(this.coverIndex, 1)[0]
					ordered.unshift(cover)
				}
				uploadLocalImages(ordered).then(urls => {
					const noteData = {
						title: String(this.title).trim(),
						content: String(this.content || '').trim(),
						cid: String(this.cid),
						cpid: String(this.cpid || this.cid),
						urls,
						noteCover: urls[0],
						tagList: (this.tagList || []).map(item => String(item).trim()).filter(Boolean),
						count: urls.length,
						type: 1,
						albumId: this.albumId || ''
					}
					if (this.isUpdate && this.noteId) {
						noteData.id = this.noteId
					}
					return submitNote(noteData)
				}).then(() => {
					uni.hideLoading()
					this.clearDraft()
					uni.showToast({
						title: this.isUpdate ? '保存成功，待审核' : '发布成功，待审核',
						icon: 'none'
					})
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/user/user'
						})
					}, 800)
				}).catch(err => {
					uni.hideLoading()
					this.submitting = false
					this.toast((err && (err.message || err.errMsg)) || '发布失败')
				})
			},
			loadNote(mid) {
				getOne({ noteId: mid }).then(res => {
					const data = (res && res.data) || {}
					this.title = data.title || ''
					this.content = data.content || ''
					this.cid = data.cid || ''
					this.cpid = data.cpid || ''
					this.coverIndex = 0
					let urls = data.urls
					if (typeof urls === 'string') {
						try {
							urls = JSON.parse(urls)
						} catch (e) {
							urls = []
						}
					}
					this.imgList = Array.isArray(urls) ? urls : []
					this.tagList = this.normalizeTags(data.tagList)
					this.resolveCategoryName()
					this.persistImages()
					uni.setStorageSync('tags', JSON.stringify(this.tagList))
				}).catch(() => {
					this.toast('笔记加载失败')
				})
			},
			resolveCategoryName() {
				if (!this.cid) return
				const apply = () => {
					const hit = this.categoryPickerList.find(item => String(item.id) === String(this.cid))
					if (hit) {
						this.categoryStr = hit.parentTitle ? (hit.parentTitle + ' / ' + hit.title) : hit.title
						this.cpid = hit.pid || this.cpid || hit.id
					}
				}
				if (this.categoryPickerList.length) {
					apply()
					return
				}
				this.loadCategoryTree().then(apply).catch(() => {})
			}
		}
	}
</script>

<style scoped>
	@import url(./push.css);
</style>
