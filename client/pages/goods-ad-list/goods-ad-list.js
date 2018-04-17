var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        canShow: false,
        me: '',
        goods: [],
        page: 1,
        loading: false,
        inputShowed: false,
        inputVal: ""
    },
    onLoad: function () { },
    onShow: function () {
        console.info("优质商品 => load");
        let that = this;
        let me = wx.getStorageSync('user');
        let roles = wx.getStorageSync('roles');
        roles.forEach(r => {
            if (r.id == me.roleId) {
                me.roleName = r.cName;
            }
        });
        that.setData({
            me: me
        });
        let token = wx.getStorageSync('authToken');
        wx.request({
            url: config.service.host + '/distributor/goodsSortByAd?page=' + that.data.page,
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: function (res_goods) {
                let goods = res_goods.data;
                goods.forEach(g => {
                    if (g.photos) {
                        g.photos_arr = g.photos.split(',')
                    }
                })
                that.setData({
                    goods: goods,
                    canShow: true
                })
                console.info(goods)
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
        util.showBusy("读取商品");
        wx.request({
            url: config.service.host + '/distributor/goodsSortByAd?page=' + that.data.page,
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: function (res_goods) {
                let current_goods = res_goods.data;
                let goods = that.data.goods;
                current_goods.forEach(g => {
                    if (g.photos) {
                        g.photos_arr = g.photos.split(',')
                    }
                    goods.push(g)
                })
                that.setData({
                    goods: goods,
                    loading: false
                })
                wx.hideToast();
                console.info(goods)
            }
        })
    },
    showInput: function () {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function () {
        this.setData({
            inputVal: "",
            inputShowed: false
        });
    },
    clearInput: function () {
        this.setData({
            inputVal: ""
        });
    },
    inputTyping: function (e) {
        this.setData({
            inputVal: e.detail.value
        });
    },
    call: function (e) {
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