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
    onLoad: function () { },
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
                    url: config.service.host + '/distributor/goodsSortByType?page=' + that.data.page + '&type=' + types[0].id,
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
                            types: types,
                            goods: goods,
                            screenId: types[0].id,
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
                    }
                })
                that.setData({
                    goods: goods
                })
                wx.hideToast();
                console.info(goods)
            }
        })
    }
})