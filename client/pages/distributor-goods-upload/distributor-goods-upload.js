var config = require('../../config')
var util = require('../../utils/util.js')
const qiniuUploader = require("../../utils/qiniuUploader-min.js");


Page({
    data: {
        me: '',
        goodsId: '',
        goods: null
    },
    onLoad: function (option) {
        this.setData({
            goodsId: option.id
        });
    },
    onShow: function () {
        console.info("上传图片 => load");
        let that = this;
        let me = wx.getStorageSync('user');
        let roles = wx.getStorageSync('roles');
        roles.forEach(r => {
            if (r.id == me.roleId) {
                me.roleName = r.cName;
            }
        });
        let token = wx.getStorageSync('authToken');
        wx.request({
            url: config.service.host + '/distributor/getGoodsById?id=' + that.data.goodsId,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_goods) => {
                that.setData({
                    me: me,
                    goods: res_goods.data
                });
            },
            fail: function (err) {

            }
        })

    },
    uploadImage: function () {
        let that = this;
        if (this.data.goods.photos && this.data.goods.photos.length >= 9) {
            util.showModel("提示", "最多只能上传9张图片");
            return;
        }
        wx.chooseImage({
            count: 9 - (that.data.goods.photos ? that.data.goods.photos.length : 0),
            success: function (res) {
                that.doUpdate(res, 0)
            }
        });
    },
    doUpdate(chooseRes, index) {
        let that = this;
        let uploadToken = wx.getStorageSync('uploadToken');
        let token = wx.getStorageSync('authToken');
        const filePath = chooseRes.tempFilePaths[index];
        qiniuUploader.upload(filePath, (res) => {
            let goods = that.data.goods;
            if (!goods.photos) {
                goods.photos = [];
            }
            goods.photos.push(res.imageURL);
            let oldphotos = goods.photos;
            goods.photos = goods.photos.toString();
            util.showBusy('正在上传图片');
            wx.request({
                url: config.service.host + '/distributor/update',
                header: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                method: 'POST',
                data: goods,
                success: function (res_distributor) {
                    goods.photos = oldphotos;
                    that.setData({
                        goods: goods
                    });
                    if (index < chooseRes.tempFilePaths.length - 1) {
                        that.doUpdate(chooseRes, index + 1);
                    } else {
                        util.showSuccess("图片上传成功");
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
                fileHead: 'image',
                imgName: new Date().getTime()
            })
    },
    deleteImage: function (e) {
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '删除确认',
            content: '您确定要将此图片删除吗？',
            confirmText: "删除",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在处理");
                    console.info(e)
                    wx.request({
                        url: config.service.host + '/qiniu/delete?entry=' + e.currentTarget.id.split('/')[1],
                        header: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        success: function (res) {
                            let goods = that.data.goods;
                            let photos = goods.photos;
                            for (let i = 0; i <= photos.length; i++) {
                                if (photos[i] == e.currentTarget.id) {
                                    photos.splice(i, 1);
                                }
                            }
                            let result = photos.join(',');
                            wx.request({
                                url: config.service.host + '/distributor/updateImage',
                                header: {
                                    'Authorization': 'Bearer ' + token
                                },
                                method: 'POST',
                                data: { images: result, id: that.data.goodsId },
                                success: (res) => {
                                    util.showSuccess("处理成功");
                                    that.setData({
                                        goods: goods
                                    })
                                },
                                fail: function (err) {

                                }
                            })
                        },
                        fail: function (err) { }
                    })
                }
            }
        });
    },
    finish: function () {
        wx.redirectTo({
            url: '../distributor-goods-list/distributor-goods-list'
        })
    }
})