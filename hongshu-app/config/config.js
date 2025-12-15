export const appConfig = {

	tokenKey: 'accessToken',  // 后端拦截器使用TokenConstant.ACCESS_TOKEN即"accessToken"
	userKey: 'userId',
	
	ImKey:'',

	// 正式环境
	// WEB_API: 'http://116.255.208.230/prod-api',
	// WS_API: 'http://116.255.208.230:8088/web/ws/',

	//开发环境（直接访问后端，端口8080）
	WEB_API: 'http://localhost:8080',
	WS_API: 'localhost:8080/web/ws/',
	
	//开发环境（如果使用Nginx代理，请使用下面的配置并确保代理运行在80端口）
	// WEB_API: 'http://localhost:80/dev-api',
	// WS_API: 'localhost:8080/web/ws/',
}