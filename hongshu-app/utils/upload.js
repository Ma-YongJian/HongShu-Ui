import { appConfig } from '@/config/config.js'
import { tokenUtil } from '@/utils/token.js'

export function mediaUrl(path) {
	if (!path) return '/static/logo.png'
	const value = String(path)
	if (/^https?:\/\//i.test(value) || value.indexOf('data:') === 0 || value.indexOf('/static') === 0 || value.indexOf('blob:') === 0) {
		return value
	}
	if (value.indexOf('/') === 0) {
		return appConfig.WEB_API + value
	}
	return value
}

export function isStoredMedia(path) {
	if (!path) return false
	const value = String(path)
	if (value.indexOf('/profile') === 0) return true
	if (/^https?:\/\//i.test(value)) {
		if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(value)) return false
		return true
	}
	return false
}

export function isLocalMedia(path) {
	return !!path && !isStoredMedia(path)
}

export function uploadImage(filePath) {
	return new Promise((resolve, reject) => {
		const token = tokenUtil.get() || ''
		if (!token) {
			reject(new Error('请先登录'))
			return
		}
		uni.uploadFile({
			url: appConfig.WEB_API + '/web/oss/save/1',
			filePath,
			name: 'file',
			header: {
				accessToken: token,
				userId: tokenUtil.getUserId() || ''
			},
			success: (res) => {
				try {
					const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
					const path = typeof data.data === 'string' ? data.data : (data.data && data.data.url)
					if (data.code === 200 && path) {
						resolve(path)
						return
					}
					reject(new Error((data && (data.message || data.msg)) || '上传失败'))
				} catch (e) {
					reject(e)
				}
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

export async function uploadLocalImages(filePaths) {
	const urls = []
	for (let i = 0; i < filePaths.length; i++) {
		const path = filePaths[i]
		if (!path) continue
		if (isLocalMedia(path)) {
			urls.push(await uploadImage(path))
		} else {
			urls.push(path)
		}
	}
	return urls
}

export function submitNote(noteData) {
	return new Promise((resolve, reject) => {
		const token = tokenUtil.get() || ''
		if (!token) {
			reject(new Error('请先登录'))
			return
		}
		const isUpdate = !!(noteData && noteData.id)
		uni.request({
			url: appConfig.WEB_API + (isUpdate ? '/web/note/updateNoteByDTO' : '/web/note/saveNoteByDTO'),
			method: 'POST',
			header: {
				'Content-Type': 'application/x-www-form-urlencoded',
				accessToken: token,
				userId: tokenUtil.getUserId() || ''
			},
			data: {
				noteData: JSON.stringify(noteData)
			},
			success: (res) => {
				const data = res.data || {}
				if (data.code === 200) {
					resolve(data)
					return
				}
				reject(new Error(data.message || data.msg || '发布失败'))
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

export function parseNoteUrls(raw) {
	if (Array.isArray(raw)) return raw.filter(Boolean)
	if (!raw) return []
	if (typeof raw === 'string') {
		const value = raw.trim()
		if (!value) return []
		try {
			const parsed = JSON.parse(value)
			return Array.isArray(parsed) ? parsed.filter(Boolean) : []
		} catch (e) {
			if (value.indexOf(',') >= 0) {
				return value.split(',').map(item => item.trim()).filter(Boolean)
			}
			return [value]
		}
	}
	return []
}

export function mapNoteMedia(note) {
	if (!note) return note
	note.avatar = mediaUrl(note.avatar)
	const rawUrls = (Array.isArray(note.imgUrls) && note.imgUrls.length)
		? note.imgUrls
		: ((Array.isArray(note.imgsUrl) && note.imgsUrl.length)
			? note.imgsUrl
			: (note.urls != null && note.urls !== '' ? note.urls : note.imgUrls))
	const urls = parseNoteUrls(rawUrls).map(item => mediaUrl(item))
	if (Array.isArray(note.imgUrls) && note.imgUrls.length) {
		note.imgUrls = note.imgUrls.map(item => mediaUrl(item))
	}
	note.imgsUrl = urls.length ? urls : (note.imgUrls || [])
	if (note.urls != null) {
		note.urls = urls
	}
	let cover = note.noteCover || note.cover
	if ((!cover || isLocalMedia(cover) || String(cover).indexOf('blob:') === 0) && note.imgsUrl.length) {
		cover = note.imgsUrl[0]
	}
	note.noteCover = mediaUrl(cover)
	if (note.cover) {
		note.cover = mediaUrl(note.cover)
	}
	if ((!note.imgsUrl || !note.imgsUrl.length) && note.noteCover) {
		note.imgsUrl = [note.noteCover]
	}
	return note
}
