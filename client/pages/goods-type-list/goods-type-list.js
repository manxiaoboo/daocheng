var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        canShow: false,
        me: '',
        goods: [],
        types: [],
        page: 1,
        loading: false,
        currentTab: 0,  //对应样式变化  
        scrollTop: 0,  //用作跳转后右侧视图回到顶部  
        screenArray: [], //左侧导航栏内容  
        screenId: "",  //后台查询需要的字段  
    },
    onLoad: function (option) {
        var that = this;
        this.setData({
            screenId: option.id,
        })
    },
    onShow: function () {
        console.info("商品分类 => load");
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
            url: config.service.host + '/distributor/types',
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_types) => {
                let types = res_types.data;
                util.showBusy("读取商品");
                wx.request({
                    url: config.service.host + '/distributor/goodsSortByType?page=' + that.data.page + '&type=' + that.data.screenId,
                    header: {
                        'content-type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    success: function (res_goods) {
                        let goods = res_goods.data;
                        goods.forEach(g => {
                            if (g.photos) {
                                g.photos_arr = g.photos.split(',')
                                if (g.photos_arr.length > 2) {
                                    g.photos_arr = g.photos_arr.slice(0, 2)
                                }
                            }
                        })

                        that.setData({
                            currentTab: types.findIndex(t => t.id === that.data.screenId),
                            types: types,
                            goods: goods,
                            canShow: true
                        })
                        wx.hideToast();
                        console.info(goods)
                    }
                })
            },
            fail: function (err) {

            }
        })
    },
    navbarTap: function (e) {
        var that = this;
        this.setData({
            currentTab: e.currentTarget.id,   //按钮CSS变化  
            screenId: e.currentTarget.dataset.screenid,
            scrollTop: 0,   //切换导航后，控制右侧滚动视图回到顶部  
        })
        //刷新右侧内容的数据
        var screenId = this.data.screenId;
        let token = wx.getStorageSync('authToken');
        util.showBusy("读取商品");
        wx.request({
            url: config.service.host + '/distributor/goodsSortByType?page=' + that.data.page + '&type=' + screenId,
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: function (res_goods) {
                let goods = res_goods.data;
                goods.forEach(g => {
                    if (g.photos) {
                        g.photos_arr = g.photos.split(',')
                        if (g.photos_arr.length > 2) {
                            g.photos_arr = g.photos_arr.slice(0, 2)
                        }
                    }
                })
                that.setData({
                    goods: goods
                })
                wx.hideToast();
                console.info(goods)
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