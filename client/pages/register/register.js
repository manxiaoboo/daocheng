var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        userInfo: {},
        logged: false,
        region: ['黑龙江省', '哈尔滨市', '松北区'],
        customItem: '全部',
        radioItems: [{
                name: '农户',
                value: '1',
                checked: true
            },
            {
                name: '专家',
                value: '0'
            }
        ],
        timmer: {},
        time: 60,
        isSendding: false,
        input_phone: '',
        input_userName: '',
        input_validateCode: '',
        input_password: '',
        input_confirm: ''
    },
    radioChange: function (e) {
        var radioItems = this.data.radioItems;
        for (var i = 0, len = radioItems.length; i < len; ++i) {
            radioItems[i].checked = radioItems[i].value == e.detail.value;
        }
        this.setData({
            radioItems: radioItems
        });
    },
    sendValidateCode: function (e) {
        var that = this;
        clearInterval(that.data.timmer);
        that.setData({
            isSendding: true
        });
        that.data.timmer = setInterval(function () {
            if (Number(that.data.time) <= 0) {
                that.setData({
                    time: 60,
                    isSendding: false
                });
                clearInterval(that.data.timmer);
                return;
            }
            var currentTime = Number(that.data.time) - 1;
            that.setData({
                time: currentTime
            });
        }, 1000);
    },
    register: function (e) {
        console.info(e.detail.value);
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
                            console.info(result);
                            that.setData({
                                userInfo: result.data.data.userinfo,
                                logged: true
                            })
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
    doInputPhone: function (e) {
        this.setData({
            input_phone: e.detail.value
        })
    },
    doInputUsername: function (e) {
        this.setData({
            input_userName: e.detail.value
        })
    },
    doInputValidateCode: function (e) {
        this.setData({
            input_validateCode: e.detail.value
        })
    },
    doInputPassword: function (e) {
        this.setData({
            input_password: e.detail.value
        })
    },
    doInputConfirm: function (e) {
        this.setData({
            input_confirm: e.detail.value
        })
    },
    goLogin: function () {
        wx.redirectTo({
            url: '../login/login'
        })
    }
})

