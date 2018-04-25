const config = require('../../config')
const util = require('../../utils/util.js')
const qiniuUploader = require("../../utils/qiniuUploader-min.js");

Page({
    data: {
        me: '',
        input_name: '',
        input_intro: '',
        input_address: '',
        input_contact: '',
        input_contactPhone: ''
    },
    onLoad: function () { },
    onShow: function () {
        console.info("修改厂商信息 => load");
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
            input_name: me.manufacturer.name,
            input_intro: me.manufacturer.intro,
            input_address: me.manufacturer.address,
            input_contact: me.manufacturer.contact,
            input_contactPhone: me.manufacturer.contactPhone
        });
    },
    editManufacturer: function (e) {
        let that = this;
        let me = this.data.me;
        me.manufacturer.address = this.data.input_address;
        me.manufacturer.intro = this.data.input_intro;
        me.manufacturer.name = this.data.input_name;
        me.manufacturer.contact = this.data.input_contact;
        me.manufacturer.contactPhone = this.data.input_contactPhone;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '修改确认',
            content: '您确定已经检查信息并修改吗？',
            confirmText: "确认修改",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在修改信息，请稍等");
                    wx.request({
                        url: config.service.host + '/users/manufacturer-edit',
                        header: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: me.manufacturer,
                        success: function (res_expert) {
                            wx.setStorageSync('user', me);
                            wx.reLaunch({
                                url: '../dashboard/dashboard'
                            })
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
                let oldhead = that.data.me.manufacturer.head;
                qiniuUploader.upload(filePath, (res) => {
                    console.info("manxiaoboo", res.imageURL);
                    let me = that.data.me;
                    me.manufacturer.head = res.imageURL;
                    util.showBusy('正在上传图片');
                    wx.request({
                        url: config.service.host + '/users/manufacturer-edit',
                        header: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: me.manufacturer,
                        success: function (res_manufacturer) {
                            wx.setStorageSync('user', me);
                            that.setData({
                                me: me
                            });
                            util.showSuccess("图片上传成功");
                            if (oldhead) {
                                wx.request({
                                    url: config.service.host + '/qiniu/delete?entry=' + oldhead.split('/')[1],
                                    header: {
                                        'content-type': 'application/json',
                                        'Authorization': 'Bearer ' + token
                                    },
                                    success: function (res) { },
                                    fail: function (err) { }
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
            input_name: e.detail.value
        })
    },
    doInputIntro: function (e) {
        this.setData({
            input_intro: e.detail.value
        })
    },
    doInputAddress: function (e) {
        this.setData({
            input_address: e.detail.value
        })
    },
    doInputContact: function (e) {
        this.setData({
            input_contact: e.detail.value
        })
    },
    doInputContactPhone: function (e) {
        this.setData({
            input_contactPhone: e.detail.value
        })
    },

})