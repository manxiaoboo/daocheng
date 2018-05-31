var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        goodsId: '',
        goods: null,
        canShow: false,
    },
    onLoad: function (option) {
        var that = this;
        this.setData({
            goodsId: option.id
        });
    },
    onShow: function () {
        console.info("商品详情 => load");
        let that = this;
        let me = wx.getStorageSync('user');
        let roles = wx.getStorageSync('roles');
        roles.forEach(r => {
            if (r.id == me.roleId) {
                me.roleName = r.cName;
            }
        });
        let token = wx.getStorageSync('authToken');
        util.showBusy("读取信息");
        wx.request({
            url: config.service.host + '/manufacturer/getGoodsById?id=' + that.data.goodsId,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_goods) => {
                if (res_goods.data.photos) {
                    res_goods.data.photos_arr = res_goods.data.photos.split(',')
                }
                wx.request({
                    url: config.service.host + '/users/manufacturerById?manufacturerId=' + res_goods.data.manufacturerId,
                    header: {
                        'Authorization': 'Bearer ' + token
                    },
                    success: (res_manufacturer) => {
                        res_goods.data.manufacturer = res_manufacturer.data;
                        that.setData({
                            me: me,
                            goods: res_goods.data,
                        });
                        console.info(res_goods.data)
                        wx.hideToast();
                    },
                    fail: function (err) {

                    }
                })
            },
            fail: function (err) {

            }
        })
    },
    deleteGoods: function (e) {
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '删除确认',
            content: '您确定要将此产品删除吗？',
            confirmText: "删除",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在处理");
                    let files = [];
                    if(that.data.goods.photos_arr){
                        that.data.goods.photos_arr.forEach(pa => {
                            files.push(pa.split('/')[1]);
                        })
                    }
                    wx.request({
                        url: config.service.host + '/qiniu/deleteBatch',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: files,
                        success: (res) => {
                            wx.request({
                                url: config.service.host + '/manufacturer/delete?id=' + that.data.goods.id,
                                header: {
                                    'Authorization': 'Bearer ' + token
                                },
                                success: (res) => {
                                    util.showSuccess("处理成功");
                                    wx.navigateBack({
                                        delta: 1
                                    })
                                },
                                fail: function (err) {

                                }
                            })
                        },
                        fail: function (err) {

                        }
                    })
                }
            }
        });
    },
    closeGoods: function (e) {
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '回收确认',
            content: '您确定要将此产品放入回收站吗（回收站中的产品可以恢复）？',
            confirmText: "回收",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在处理");
                    wx.request({
                        url: config.service.host + '/manufacturer/recovery',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: that.data.goods,
                        success: (res) => {
                            util.showSuccess("处理成功");
                            wx.navigateBack({
                                delta: 1
                            })
                        },
                        fail: function (err) {

                        }
                    })
                }
            }
        });
    },
    openGoods: function (e) {
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '恢复确认',
            content: '您确定要恢复此产品吗？',
            confirmText: "恢复",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在处理");
                    wx.request({
                        url: config.service.host + '/manufacturer/reRecovery',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: that.data.goods,
                        success: (res_check) => {
                            util.showSuccess("处理成功");
                            wx.navigateBack({
                                delta: 1
                            })
                        },
                        fail: function (err) {

                        }
                    })
                }
            }
        });
    },
    goEdit: function () {
        wx.redirectTo({
            url: '../manufacturer-goods-edit/manufacturer-goods-edit?id=' + this.data.goodsId
        })
    },
    call: function () {
        if (this.data.me.role == 'visitor') {
            wx.showModal({
              title: '游客提示',
              content: '您尚未登录，是否立即登录？',
              confirmText: "登录",
              cancelText: "取消",
              success: function (res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../login/login'
                  })
                }
              }
            });
            return;
          }
        wx.makePhoneCall({
            phoneNumber: this.data.goods.manufacturer.contactPhone,
            success: function () {
                console.log("拨打电话成功！")
            },
            fail: function () {
                console.log("拨打电话失败！")
            }
        })
    },
    preview: function (e) {
        let urls = [];
        this.data.goods.photos_arr.forEach(pa => {
            urls.push("http://" + pa);
        })
        wx.previewImage({
            current: "http://" + e.currentTarget.dataset.currentImage,
            urls: urls
        })
    }
})