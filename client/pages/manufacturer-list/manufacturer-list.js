var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        canShow: false,
        me: '',
        manufacturers: [],
        types: [],
        page: 1,
        loading: false,
        inputShowed: false,
        inputVal: "",
        currentTab: 0,  //对应样式变化
        scrollTop: 0,  //用作跳转后右侧视图回到顶部
        screenArray: [], //左侧导航栏内容
        screenId: "",  //后台查询需要的字段
    },
    onLoad: function () {
    },
    onShow: function () {
        console.info("厂商列表 => load");
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
                if (types && types.length > 0) {
                    that.setData({
                        screenId: types[0].id
                    })
                }
                util.showBusy("读取厂商");
                wx.request({
                    url: config.service.host + '/manufacturer/validateManufacturerUser?page=' + that.data.page + '&type=' + that.data.screenId,
                    header: {
                        'Authorization': 'Bearer ' + token
                    },
                    success: (res_manufacturer) => {
                        console.info(res_manufacturer.data)
                        this.setData({
                            currentTab: types.findIndex(t => t.id === that.data.screenId),
                            types: types,
                            canShow: true,
                            manufacturers: res_manufacturer.data
                        })
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
    navbarTap: function (e) {
        var that = this;
        this.setData({
            currentTab: e.currentTarget.id,   //按钮CSS变化  
            screenId: e.currentTarget.dataset.screenid,
            scrollTop: 0,   //切换导航后，控制右侧滚动视图回到顶部  
            page: 1
        })
        //刷新右侧内容的数据
        var screenId = this.data.screenId;
        let token = wx.getStorageSync('authToken');
        util.showBusy("读取商品");
        wx.request({
            url: config.service.host + '/manufacturer/validateManufacturerUser?page=' + that.data.page + '&type=' + that.data.screenId,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_manufacturer) => {
                this.setData({
                    manufacturers: res_manufacturer.data
                })
                wx.hideToast();
            },
            fail: function (err) {

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
            url: config.service.host + '/manufacturer/validateManufacturerUser?page=' + that.data.page + '&type=' + that.data.screenId,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_manufacturer) => {
                this.setData({
                    manufacturers: res_manufacturer.data
                })
                wx.hideToast();
            },
            fail: function (err) {

            }
        })
    },
})