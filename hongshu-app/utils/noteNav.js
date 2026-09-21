import { addBrowseRecord } from '@/api/browseRecord.js'
import { tokenUtil } from '@/utils/token.js'
import { mediaUrl } from '@/utils/upload.js'

export function toNoteCard(item) {
	if (!item) return {}
	const id = item.nid || item.id || item.mid
	const urls = item.imgsUrl || item.imgUrls || []
	const cover = mediaUrl(item.noteCover || item.cover || item.image || (urls && urls[0]))
	return {
		id,
		nid: item.nid || id,
		uid: item.uid,
		noteCover: cover,
		image: cover,
		title: item.title || item.content || '',
		content: item.title || item.content || '',
		avatar: mediaUrl(item.avatar),
		username: item.username,
		agreeCount: item.likeCount || item.agreeCount || 0,
		likeCount: item.likeCount || item.agreeCount || 0,
		isLike: item.isLike,
		noteCoverHeight: item.noteCoverHeight || item.height,
		noteType: item.noteType,
		auditStatus: item.auditStatus
	}
}

export function currentUid() {
	const user = uni.getStorageSync('userInfo') || {}
	return user.id || tokenUtil.getUserId() || ''
}

export function ensureLogin() {
	if (tokenUtil.get() && currentUid()) return true
	uni.navigateTo({
		url: '/pages/login/login'
	})
	return false
}

export function openNote(noteId) {
	const id = noteId && typeof noteId === 'object' ? (noteId.id || noteId.nid || noteId.mid) : noteId
	if (!id) return
	const go = () => {
		uni.navigateTo({
			url: '/pages/main/main?mid=' + id
		})
	}
	const uid = currentUid()
	if (!uid) {
		go()
		return
	}
	addBrowseRecord({
		uid,
		nid: String(id)
	}).then(go).catch(go)
}

export function noticeThumb(item) {
	if (!item) return ''
	return mediaUrl(item.itemCover || item.noteCover || item.cover || item.albumCover || item.notesCoverPicture)
}

export function emitNoteDeleted(id) {
	const noteId = id && typeof id === 'object' ? (id.id || id.nid || id.mid) : id
	if (!noteId) return
	uni.$emit('note_deleted', { id: String(noteId) })
}

export function dropDeletedNote(vm, payload) {
	const target = String((payload && (payload.id || payload.noteId || payload.nid)) || '')
	if (!vm || !target) return
	const keep = (item) => {
		if (!item) return false
		return String(item.id || item.nid || item.mid || '') !== target
	}
	;['list', 'dataList'].forEach((key) => {
		if (Array.isArray(vm[key])) vm[key] = vm[key].filter(keep)
	})
	;['list1', 'list2'].forEach((key) => {
		if (Array.isArray(vm[key])) vm[key] = vm[key].filter(keep)
	})
}

export const noteDeletedMixin = {
	created() {
		this._onNoteDeleted = (payload) => dropDeletedNote(this, payload)
		uni.$on('note_deleted', this._onNoteDeleted)
	},
	beforeDestroy() {
		if (this._onNoteDeleted) uni.$off('note_deleted', this._onNoteDeleted)
	}
}

export function openUser(uid) {
	if (!uid) return
	if (String(uid) === String(currentUid())) {
		uni.switchTab({
			url: '/pages/user/user'
		})
		return
	}
	uni.navigateTo({
		url: '/pages/otherUser/otherUser?uid=' + uid
	})
}
