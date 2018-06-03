const config = require('../../config')
const util = require('../../utils/util.js')
const qiniuUploader = require("../../utils/qiniuUploader-min.js");

Page({
    data: {
        me: '',
        manufacturerId: '',
        manufacturer: null,
        page: 1,
    },
    onLoad: function (option) {
        this.setData({
            manufacturerId: option.id
        })
    },
    onShow: function () {
        console.info("店铺主页 => load");
        let that = this;
        let me = wx.getStorageSync('user');
        let roles = wx.getStorageSync('roles');
        let token = wx.getStorageSync('authToken');
        roles.forEach(r => {
            if (r.id == me.roleId) {
                me.roleName = r.cName;
            }
        });
        wx.request({
            url: config.service.host + '/users/manufacturerPackById?manufacturerId=' + that.data.manufacturerId + '&page=1',
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: function (res_manufacturer) {
                let manufacturer = res_manufacturer.data;
                manufacturer.goods.forEach(g => {
                    if (g.photos) {
                        g.photos_arr = g.photos.split(',')
                        if (g.photos_arr.length > 2) {
                            g.photos_arr.pop();
                            g.photos_arr.pop();
                        }
                    }
                    g.updatedDate = util.formatTime2(new Date(g.updatedAt));
                    g.intro = g.intro.slice(1, 20) + '...';
                })
                console.info(manufacturer)
                that.setData({
                    manufacturer: manufacturer,
                    me: me
                });
            }
        })
    },
    onReachBottom: function () {
        let that = this;
        let page = this.data.page;
        page++;
        let token = wx.getStorageSync('authToken');
        this.setData({
            page: page
        })
        that.setData({ loading: true })
        wx.request({
            url: config.service.host + '/users/manufacturerPackById?manufacturerId=' + that.data.manufacturerId + '&page=' + that.data.page,
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: function (res_manufacturer) {
                let current_goods = res_manufacturer.data.goods;
                let manufacturer = that.data.manufacturer;
                current_goods.forEach(g => {
                    if (g.photos) {
                        g.photos_arr = g.photos.split(',')
                        if (g.photos_arr.length > 2) {
                            g.photos_arr.pop();
                            g.photos_arr.pop();
                        }
                    }
                    g.updatedDate = util.formatTime2(new Date(g.updatedAt));
                    g.intro = g.intro.slice(1, 20) + '...';
                    manufacturer.goods.push(g)
                })
                that.setData({
                    manufacturer: manufacturer,
                    loading: false
                })
            }
        })
    },
    call: function (e) {
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
            phoneNumber: e.currentTarget.dataset.phone,
            success: function () {
                console.log("拨打电话成功！")
            },
            fail: function () {
                console.log("拨打电话失败！")
            }
        })
    }
})