var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        motto: '稻成一体化平台',
        userName: '',
        password: ''
    },
    onLoad: function () {},
    goRegister: function () {
        wx.redirectTo({
            url: '../register/register'
        })
    },
    logIn: function () {
        var that = this;
        if (!this.data.userName) {
            util.showModel("提示", "请填写用户名");
            return;
        }
        if (!this.data.password) {
            util.showModel("提示", "请填写密码");
            return;
        }
        util.showBusy("正在登陆");
        wx.request({
            url: config.service.host + '/auth/local',
            header: {
                'content-type': 'application/json'
            },
            method: 'POST',
            data: {
                userName: that.data.userName,
                password: that.data.password
            },
            success: function (res) {
                if (res.statusCode == 401) {
                    util.showBusy("检查账户");
                    wx.request({
                        url: config.service.host + '/users/check-audit',
                        header: {
                            'content-type': 'application/json'
                        },
                        method: 'POST',
                        data: {
                            userName: that.data.userName
                        },
                        success: function (res) {
                            if (res.data) {
                                util.showModel("提示", "您的账户正在审核，请耐心等待。");
                            } else {
                                util.showModel("提示", "用户名或密码错误");
                            }
                        },
                        fail: function (err) {
                            console.info(err);
                        }
                    })
                } else {
                    wx.setStorage({
                        key: "authToken",
                        data: res.data.token,
                        success: function () {
                            util.showSuccess("成功登录");
                            wx.switchTab({
                                url: '../dashboard/dashboard'
                            })
                        }
                    })
                }
            },
            fail: function (err) {
                console.info(err);
            }
        })
    },
    userNameInput: function (e) {
        this.setData({
            userName: e.detail.value
        });
    },
    userPasswordInput: function (e) {
        this.setData({
            password: e.detail.value
        });
    }
})