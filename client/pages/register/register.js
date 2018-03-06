var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        userInfo: {},
        logged: false,
        region: ['黑龙江省', '哈尔滨市', '松北区'],
        customItem: '全部',
        roles: [],
        pickerRoles: [],
        timmer: {},
        time: 60,
        isSendding: false,
        roleIndex: 0,
        input_phone: '',
        input_userName: '',
        input_validateCode: '',
        input_password: '',
        input_confirm: '',
        input_roleId: '27ea4974-e6c4-11e7-b42e-060400ef5315',
        successd: false,
        successdTime: 5
    },
    roleChange: function (e) {
        // var roles = this.data.roles;
        // for (var i = 0, len = roles.length; i < len; ++i) {
        //     roles[i].checked = roles[i].id == e.detail.value;
        // }
        let name = this.data.pickerRoles[e.detail.value];
        this.data.roles.forEach(r => {
            if (r.cName == name) {
                this.setData({
                    input_roleId: r.id
                })
            }
        });
        this.setData({
            roleIndex: e.detail.value
        })
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
        var that = this;
        let audit_user = e.detail.value;
        audit_user.nickName = this.data.userInfo.nickName;
        audit_user.picture = this.data.userInfo.avatarUrl;
        audit_user.openId = this.data.userInfo.openId;
        audit_user.province = this.data.region[0];
        audit_user.city = this.data.region[1];
        audit_user.area = this.data.region[2];
        audit_user.isValidate = 0;
        audit_user.roleId = this.data.input_roleId;
        if (this.data.input_validateCode != '1234') {
            util.showModel("提示", "验证码输入错误");
            return;
        }
        if (!audit_user.userName) {
            util.showModel("提示", "请填写用户名");
            return;
        }
        if (!audit_user.phone) {
            util.showModel("提示", "请填写电话");
            return;
        }
        if (!audit_user.password) {
            util.showModel("提示", "请填写密码");
            return;
        }
        if (audit_user.password != this.data.input_confirm) {
            util.showModel("提示", "密码填写不一致");
            return;
        }
        wx.showModal({
            title: '注册确认',
            content: '您确定已经检查信息并注册吗？',
            confirmText: "注册",
            cancelText: "取消",
            success: function (res) {
                console.log(res);
                if (res.confirm) {
                    util.showBusy("正在注册用户，请稍等");
                    wx.request({
                        url: config.service.host + '/users/audit-user',
                        method: 'POST',
                        data: audit_user,
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function (res) {
                            util.showModel("提示", "注册成功，5秒后自动跳转到登陆页面");
                            that.setData({
                                successd: true
                            });
                            let timmer = setInterval(function () {
                                that.setData({
                                    successdTime: that.data.successdTime - 1
                                });
                                if (that.data.successdTime <= 0) {
                                    clearInterval(timmer);
                                    wx.redirectTo({
                                        url: '../login/login'
                                    })
                                }
                            }, 1000);
                        }
                    })
                }
            }
        });

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
        wx.request({
            url: config.service.host + '/users/roles',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                var roles = res.data;
                let pickerRoles = [];
                roles.forEach((r) => {
                    if (r.name != 'admin' && r.name != 'operator' && r.name != 'manufacturer') {
                        pickerRoles.push(r.cName);
                    }
                })
                that.setData({
                    roles: roles.filter((r) => {
                        if (r.name == 'farmer') r.checked = true;
                        return r.name != 'admin' && r.name != 'operator';
                    }),
                    pickerRoles: pickerRoles
                });
            }
        })
    },
    bindRegionChange: function (e) {
        this.setData({
            region: e.detail.value
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