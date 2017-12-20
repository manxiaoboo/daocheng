var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        userInfo: {},
        logged: false
    },
    onLoad: function () {
        var that = this;
        util.showBusy('拉取信息')
        qcloud.login({
            success(result) {
                if (result) {
                    util.showSuccess('填入成功')
                    that.setData({
                        userInfo: result,
                        logged: true
                    })
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            util.showSuccess('填入成功')
                            that.setData({
                                userInfo: result.data.data.userinfo,
                                logged: true
                            })
                            console.info(that);
                        },
                        fail(error) {
                            util.showModel('请求失败', error)
                            console.log('request fail', error)
                        }
                    })
                }
            },
            fail(error) {
                util.showModel('登录失败', error)
                console.log('登录失败', error)
            }
        })
    },
    goLogin: function () {
        wx.redirectTo({
            url: '../login/login'
        })
    }
})