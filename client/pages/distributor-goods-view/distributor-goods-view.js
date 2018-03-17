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
        tabs: ["规格参数", "图文详情", "购买流程"],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        isAuditing: false
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
        util.showBusy("读取信息");
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
                        wx.request({
                            url: config.service.host + '/distributor/auditGoodsByGoodsId?id=' + res_goods.data.id,
                            header: {
                                'Authorization': 'Bearer ' + token
                            },
                            success: (res_audit_goods) => {
                                let audit_goods = res_audit_goods.data;
                                that.setData({
                                    me: me,
                                    goods: res_goods.data,
                                    isAuditing: audit_goods.length > 0 ? true : false
                                });
                                console.info(res_goods.data)
                                console.info(that.data.goodsId)
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
            fail: function (err) {

            }
        })
        setTimeout(()=>{
            if(that.data.me.roleName == '农户'){
                wx.request({
                    url: config.service.host + '/distributor/farmerlook?id='+that.data.goodsId,
                    header: {
                        'Authorization': 'Bearer ' + token
                    }
                })
            }
        },20000)
    },
    doAudit: function () {
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '提交确认',
            content: '您确定要将此商品提交审核吗？',
            confirmText: "提交",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在处理");
                    const audit_goods = {
                        distributorGoodsId: that.data.goodsId,
                        type: 'create'
                    }
                    wx.request({
                        url: config.service.host + '/distributor/createAuditGoods',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: audit_goods,
                        success: (res) => {
                            that.onShow();
                            util.showSuccess("处理成功");
                        },
                        fail: function (err) {

                        }
                    })
                }
            }
        });
    },
    deleteGoods: function (e) {
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '删除确认',
            content: '您确定要将此商品删除吗？',
            confirmText: "删除",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在处理");
                    let files = [];
                    that.data.goods.photos_arr.forEach(pa => {
                        files.push(pa.split('/')[1]);
                    })
                    wx.request({
                        url: config.service.host + '/qiniu/deleteBatch',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: files,
                        success: (res) => {
                            wx.request({
                                url: config.service.host + '/distributor/delete?id=' + that.data.goods.id,
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
            title: '下架确认',
            content: '您确定要将此商品下架吗（下架后可以重新上架）？',
            confirmText: "下架",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在处理");
                    wx.request({
                        url: config.service.host + '/distributor/close?id=' + that.data.goodsId,
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
                }
            }
        });
    },
    openGoods: function (e) {
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '上架确认',
            content: '您确定要将此重新商品上架吗？',
            confirmText: "上架",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在处理");
                    wx.request({
                        url: config.service.host + '/distributor/checkAuditGoods?id=' + that.data.goodsId,
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        success: (res_check) => {
                            if (res_check.data && res_check.data.length > 0) {
                                util.showModel("处理失败", "该商品可能正在被审核")
                            } else {
                                wx.request({
                                    url: config.service.host + '/distributor/open?id=' + that.data.goodsId,
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
                            }
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
            url: '../distributor-goods-edit/distributor-goods-edit?id=' + this.data.goodsId
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
    },
    createOrder: function (e) {
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '订单确认',
            content: '您确定要为此商品创建订单吗？',
            confirmText: "确认",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("生成订单");
                    let order = {
                        data: that.data.goods,
                        distributorId: that.data.goods.distributorId,
                        farmerId: that.data.me.id
                    }
                    wx.request({
                        url: config.service.host + '/order/create',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: order,
                        success: (res_check) => {
                            util.showSuccess('处理成功')
                            wx.redirectTo({
                                url: '../order-farmer-detail/order-farmer-detail?id=' + res_check.data.id
                            })
                        },
                        fail: function (err) {
                            util.showModal("处理失败", "创建订单失败");
                        }
                    })
                }
            }
        });
    }
})