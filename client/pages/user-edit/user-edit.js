const config = require('../../config')
const util = require('../../utils/util.js')
const qiniuUploader = require("../../utils/qiniuUploader-min.js");

Page({
    data: {
        me: '',
        input_nickName: ''
    },
    onLoad: function () {},
    onShow: function () {
        console.info("修改用户信息 => load");
        let that = this;
        let me = wx.getStorageSync('user');
        let roles = wx.getStorageSync('roles');
        roles.forEach(r => {
            if (r.id == me.roleId) {
                me.roleName = r.cName;
            }
        });
        that.setData({
            me: me,
            input_nickName: me.nickName
        });
    },
    editUser: function (e) {
        let that = this;
        let me = this.data.me;
        me.nickName = this.data.input_nickName;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '修改确认',
            content: '您确定已经检查信息并修改吗？',
            confirmText: "确认修改",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在修改");
                    wx.request({
                        url: config.service.host + '/users/user-edit',
                        header: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: me,
                        success: function (res_expert) {
                            wx.removeStorageSync('user')
                            wx.setStorageSync('user', me);
                            util.showSuccess("修改成功");
                            setTimeout(()=>{
                                wx.reLaunch({
                                    url: '../person-center/person-center'
                                })
                            }, 2000)
                        },
                        fail: function (err) {
                            wx.navigateBack({
                                delta: 1
                            })
                        }
                    })
                }
            }
        });
    },
    uploadImage: function (e) {
        let that = this;
        let uploadToken = wx.getStorageSync('uploadToken');
        let token = wx.getStorageSync('authToken');
        wx.chooseImage({
            count: 1,
            success: function (res) {
                var filePath = res.tempFilePaths[0];
                let oldhead = that.data.me.picture;
                qiniuUploader.upload(filePath, (res) => {
                    console.info("manxiaoboo", res.imageURL);
                    let me = that.data.me;
                    me.picture = 'http://'+ res.imageURL;
                    util.showBusy('正在上传图片');
                    wx.request({
                        url: config.service.host + '/users/user-edit',
                        header: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: me,
                        success: function (res_distributor) {
                            wx.setStorageSync('user', me);
                            that.setData({
                                me: me
                            });
                            util.showSuccess("图片上传成功");
                            if (oldhead) {
                                let arr = oldhead.split('/');
                                wx.request({
                                    url: config.service.host + '/qiniu/delete?entry=' + arr[arr.length-1],
                                    header: {
                                        'content-type': 'application/json',
                                        'Authorization': 'Bearer ' + token
                                    },
                                    success: function (res) {},
                                    fail: function (err) {}
                                })
                            }
                        },
                        fail: function (err) {
                            util.showModel("失败", "图片上传失败");
                        }
                    })
                }, (error) => {
                    console.log('error: ' + error);
                }, {
                    region: 'ECN',
                    uploadURL: 'https://up.qbox.me',
                    domain: 'p2nrs4i3e.bkt.clouddn.com',
                    uptoken: uploadToken,
                    shouldUseQiniuFileName: true
                })
            }
        });

    },
    doInputName: function (e) {
        this.setData({
            input_nickName: e.detail.value
        })
    }
})