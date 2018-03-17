var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        me: '',
        timmer: {},
        time: 60,
        input_phone: '',
        input_userName: '',
        input_validateCode: '',
        input_password: '',
        input_confirm: '',
        passcode: '',
        validated: false
    },
    sendValidateCode: function (e) {
        var that = this;
        let code = '';
        do {
            code = Math.floor(Math.random() * 10000);
        }
        while (code < 1000) {
            that.setData({
                passcode: code
            });
            const myreg = /^(((1[0-9]{1}[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
            if (!myreg.test(that.data.input_phone)) {
                util.showModel("提示", "请输入有效的手机号码！");
                return;
            }
            that.sendMessage(code, that.data.input_phone);
        }


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
    sendMessage: function (code, phone) {
        wx.request({
            url: config.service.host + '/users/sendCode',
            method: 'POST',
            data: {
                code: code,
                phone: phone
            },
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {}
        })
    },
    edit: function (e) {
        var that = this;
        let audit_user = e.detail.value;
        if (!audit_user.password) {
            util.showModel("提示", "请填写密码");
            return;
        }
        if (audit_user.password != this.data.input_confirm) {
            util.showModel("提示", "密码填写不一致");
            return;
        }
        wx.showModal({
            title: '修改确认',
            content: '您确定修改密码吗？',
            confirmText: "修改",
            cancelText: "取消",
            success: function (res) {
                console.log(res);
                if (res.confirm) {
                    util.showBusy("修改密码");
                    wx.request({
                        url: config.service.host + '/users/changePassword',
                        method: 'POST',
                        data: {user:that.data.me,password:audit_user.password},
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function (res) {
                            util.showSuccess("修改成功");
                            setTimeout(()=>{
                                wx.redirectTo({
                                    url: '../login/login'
                                })
                            },2000)
                        }
                    })
                }
            }
        });

    },
    onLoad: function () {},
    check: function (e) {
        let that = this;
        let audit_user = e.detail.value;

        if (!audit_user.userName) {
            util.showModel("提示", "请填写用户名");
            return;
        }
        if (!audit_user.phone) {
            util.showModel("提示", "请填写电话");
            return;
        }
        const myreg = /^(((1[0-9]{1}[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        if (!myreg.test(audit_user.phone)) {
            util.showModel("提示", "请输入有效的手机号码！");
            return;
        }
        if (!this.data.input_validateCode) {
            util.showModel("提示", "请输入验证码");
            return;
        }
        if (this.data.input_validateCode != this.data.passcode) {
            // if (this.data.input_validateCode != '1234') {
            util.showModel("提示", "验证码输入错误");
            return;
        }
        util.showBusy('检测用户')
        wx.request({
            url: config.service.host + '/users/getUserByNameAndPhone?userName='+audit_user.userName+'&phone='+audit_user.phone,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                let users = res.data;
                if (!users || users.length <= 0) {
                    util.showModel("提示", "用户不存在");
                    wx.hideToast();
                } else {
                   that.setData({
                       me: users,
                       validated: true
                   })
                   wx.hideToast();
                }
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