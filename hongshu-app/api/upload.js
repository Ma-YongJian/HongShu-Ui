import {
	request
} from '../utils/request.js'
import {
	appConfig
} from '../config/config.js'



export function uploadOssFile(data) {
	return request.post(appConfig.WEB_API + '/web/browseRecord/addBrowseRecord', data)
}
