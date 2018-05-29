var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: ''
    },
    onLoad: function () {
        console.info("我的 => load");
        var that = this;
        wx.getStorage({
            key: 'user',
            success: function (res) {
                let me = res.data;
                wx.getStorage({
                    key: 'roles',
                    success: function (res_roles) {
                        let roles = res_roles.data;
                        roles.forEach(r => {
                            if (r.id == me.roleId) {
                                me.roleName = r.cName;
                            }
                        });
                        that.setData({
                            me: me
                        });
                        console.info(that.data.me);
                    }
                })
            }
        })
    },
    logout: function () {
        var that = this;
        wx.showModal({
            title: '退出确认',
            content: '您确定要安全退出系统吗？',
            confirmText: "退出",
            cancelText: "取消",
            success: function (res) {
                console.log(res);
                if (res.confirm) {
                    wx.removeStorage({
                        key: 'authToken',
                        success: function (res) {
                            wx.redirectTo({
                                url: '../login/login'
                            })
                        }
                    })
                }
            }
        });
    },
    goLogin: function () {
        wx.redirectTo({
            url: '../login/login'
        })
    }
})