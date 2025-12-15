// import { appConfig } from '../config/config.js'
// import { tokenUtil } from './token'

// const send = (url, data = {}, method = 'POST', showLoading = true) => {

//     return new Promise((resolve, reject) => {
//         let expiration = uni.getStorageSync('expiration');
//         let isRefresh = false;
        
//         if (expiration) {
//             let tmp = expiration.toString().replace(/-/g, "/");
//             let futureTime = new Date(tmp).valueOf();
//             let nowTime = new Date().valueOf();
//             let jetLag = (futureTime - nowTime) / 1000 / 60 / 60;

//             if (jetLag < 1 && !isRefresh) {
//                 isRefresh = true;
//                 let userInfo = uni.getStorageSync("userInfo");
//                 uni.request({
//                     method: 'post',
//                     url: appConfig.WEB_API + "/web/auth/refreshToken",
//                     data: userInfo,
//                     header: {
//                         'Content-Type': 'application/json'
//                     },
//                     success: (response) => {
//                         let refreshToken = response.data.data.JwtToken;
//                         uni.setStorageSync("expiration", response.data.data.expiration);
//                         tokenUtil.set(refreshToken);
//                     },
//                     fail: (err) => {
//                         reject(err);
//                     }
//                 });
//             }
//         }

//         uni.request({
//             method: method,
//             url: url,
//             data: data,
//             header: (() => {
//                 const tokenValue = tokenUtil.get();
// 				const userId = tokenUtil.getUserId();
//                 let config = {
//                     'Content-Type': 'application/json'
//                 }

//                 if (tokenValue) {
//                     config[appConfig.tokenKey] = tokenValue;
// 					config[appConfig.userKey] = userId;
//                 }
//                 return config;
//             })(),
//             success: (res) => {
//                 uni.hideLoading();

//                 if (res.data.code == 401) {
//                     uni.showToast({
//                         icon: "none",
//                         title: "用户未认证或登录过期,请重新登录"
//                     });
//                     uni.removeStorageSync("userInfo");
//                     tokenUtil.clear();
//                     setTimeout(() => {
//                         uni.reLaunch({
//                             url: "/pages/login/login"
//                         });
//                     }, 1000);
//                 } else {
//                     resolve(res.data);
//                 }
//             },
//             fail: (err) => {
//                 uni.hideLoading();
//                 reject(err);
//             }
//         });
//     });
// }

// export const request = {
//     get: (url, data) => {
//         return send(url, data, 'GET');
//     },
//     post: (url, data) => {
//         return send(url, data, 'POST');
//     }
// }

import { appConfig } from '../config/config.js';
import { tokenUtil } from './token';

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
    refreshSubscribers.forEach(callback => callback(newToken));
    refreshSubscribers = [];
};

const subscribeTokenRefresh = (callback) => {
    refreshSubscribers.push(callback);
};

const send = (url, data = {}, method = 'POST', showLoading = true) => {
    return new Promise((resolve, reject) => {
        let expiration = uni.getStorageSync('expiration');
        
        if (expiration) {
            let tmp = expiration.toString().replace(/-/g, "/");
            let futureTime = new Date(tmp).valueOf();
            let nowTime = new Date().valueOf();
            let jetLag = (futureTime - nowTime) / 1000 / 60 / 60;

            if (jetLag < 1 && !isRefreshing) {
                isRefreshing = true;
                let userInfo = uni.getStorageSync("userInfo");
                uni.request({
                    method: 'post',
                    url: appConfig.WEB_API + "/web/auth/refreshToken",
                    data: userInfo,
                    header: {
                        'Content-Type': 'application/json'
                    },
                    success: (response) => {
                        // 根据后端返回格式，refreshToken接口返回accessToken和refreshToken
                        if (response.data.code === 200 && response.data.data) {
                            let accessToken = response.data.data.accessToken;
                            if (accessToken) {
                                // 清除旧的token
                                uni.removeStorageSync('JwtToken');
                                tokenUtil.set(accessToken);
                                isRefreshing = false;
                                onRefreshed(accessToken);
                            } else {
                                isRefreshing = false;
                                reject(new Error('刷新token失败'));
                            }
                        } else {
                            isRefreshing = false;
                            reject(new Error(response.data.message || '刷新token失败'));
                        }
                    },
                    fail: (err) => {
                        isRefreshing = false;
                        reject(err);
                    }
                });
                
                subscribeTokenRefresh((newToken) => {
                    makeRequest(newToken);
                });
            } else if (isRefreshing) {
                subscribeTokenRefresh((newToken) => {
                    makeRequest(newToken);
                });
            } else {
                makeRequest(tokenUtil.get());
            }
        } else {
            makeRequest(tokenUtil.get());
        }

        function makeRequest(token) {
            uni.request({
                method: method,
                url: url,
                data: data,
                header: (() => {
                    const userId = tokenUtil.getUserId();
                    let config = {
                        'Content-Type': 'application/json'
                    }

                    if (token) {
                        // 后端拦截器使用TokenConstant.ACCESS_TOKEN即"accessToken"作为header名称
                        // JwtUtils.checkToken直接解析JWT字符串，不需要Bearer前缀
                        config[appConfig.tokenKey] = token;
                        if (userId) {
                            config[appConfig.userKey] = userId;
                        }
                    }
                    // 调试日志（开发环境）
                    // console.log('请求配置:', {
                    //     url: url,
                    //     tokenKey: appConfig.tokenKey,
                    //     hasToken: !!token
                    // });
                    return config;
                })(),
                success: (res) => {
                    uni.hideLoading();
                    if (res.data.code == 401) {
                        // 清除所有可能的token存储（兼容旧版本）
                        uni.removeStorageSync("userInfo");
                        uni.removeStorageSync("JwtToken");
                        tokenUtil.clear();
                        tokenUtil.clearUserId();
                        
                        uni.showToast({
                            icon: "none",
                            title: res.data.message || "用户未认证或登录过期,请重新登录"
                        });
                        setTimeout(() => {
                            uni.reLaunch({
                                url: "/pages/login/login"
                            });
                        }, 1000);
                    } else {
                        resolve(res.data);
                    }
                },
                fail: (err) => {
                    uni.hideLoading();
                    reject(err);
                }
            });
        }
    });
};

export const request = {
    get: (url, data) => {
        return send(url, data, 'GET');
    },
    post: (url, data) => {
        return send(url, data, 'POST');
    }
};
