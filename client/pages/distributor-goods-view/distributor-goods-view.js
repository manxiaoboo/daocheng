var config = require('../../config')
var util = require('../../utils/util.js')
var sliderWidth = 96;
Page({
    data: {
        me: '',
        goodsId: '',
        goods: null,
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        canShow: false,
        tabs: ["规格参数","图文详情", "购买流程"],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0
    },
    onLoad: function (option) {
        var that = this;
        this.setData({
            goodsId: option.id
        });
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                });
            }
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
        wx.request({
            url: config.service.host + '/distributor/getGoodsById?id=' + that.data.goodsId,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_goods) => {
                if (res_goods.data.photos) {
                    res_goods.data.photos_arr = res_goods.data.photos.split(',')
                }
                if (res_goods.data.specDesc) {
                    res_goods.data.specDesc = res_goods.data.specDesc.replace(/：/g, ':')
                    res_goods.data.specDesc = res_goods.data.specDesc.replace(/；/g, ';')
                    res_goods.data.specDesc = res_goods.data.specDesc.split(';')
                }
                wx.request({
                    url: config.service.host + '/users/distributorById?distributorId=' + res_goods.data.distributorId,
                    header: {
                        'Authorization': 'Bearer ' + token
                    },
                    success: (res_distributor) => {
                        res_goods.data.distributor = res_distributor.data;
                        that.setData({
                            me: me,
                            goods: res_goods.data
                        });
                        console.info(res_goods.data)
                        console.info(that.data.goodsId)
                    },
                    fail: function (err) {

                    }
                })
            },
            fail: function (err) {

            }
        })
    },
    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
    },
    call: function () {
        wx.makePhoneCall({
            phoneNumber: this.data.goods.distributor.contactPhone,
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