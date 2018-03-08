var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        canShow: false,
        orderId: '',
        me: '',
        orders: [],
        page: 1,
        loading: false,
        currentTab: 0, 
        scrollTop: 0,  
        screenArray: [{ id: 'new', name: '新建' }, { id: 'sent', name: '已发送' }, { id: 'return', name: '待确认' }, { id: 'done', name: '已完成' }], //左侧导航栏内容  
        screenId: "new", 
    },
    onLoad: function () { },
    onShow: function () {
        this.setData({
            canShow: false,
            orderId: '',
            me: '',
            orders: [],
            page: 1,
            loading: false,
            currentTab: 0, 
            scrollTop: 0, 
            screenArray: [{ id: 'new', name: '新建' }, { id: 'sent', name: '已发送' }, { id: 'return', name: '待确认' }, { id: 'done', name: '已完成' }], //左侧导航栏内容  
            screenId: "new",
        })
        console.info("订单导航 => load");
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
        util.showBusy("读取订单");
        wx.request({
            url: config.service.host + '/order/getFarmerOrders?id=' + me.id + '&status=new&page=' + that.data.page,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_orders) => {
                console.info(res_orders.data)
                let orders = res_orders.data;
                that.setData({
                    orders: orders,
                    canShow: true
                })
                wx.hideToast();
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
        util.showBusy("读取订单");
        wx.request({
            url: config.service.host + '/order/getFarmerOrders?id=' + that.data.me.id + '&status=' + screenId + '&page=' + that.data.page,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_orders) => {
                console.info(res_orders.data)
                let orders = res_orders.data;
                that.setData({
                    orders: orders,
                    canShow: true
                })
                wx.hideToast();
            },
            fail: function (err) {

            }
        })
    },
    loadMore: function () {
        let that = this;
        let page = this.data.page;
        page++;
        let token = wx.getStorageSync('authToken');
        this.setData({
            page: page
        })
        util.showBusy("读取订单");
        wx.request({
            url: config.service.host + '/order/getFarmerOrders?id=' + that.data.me.id + '&status=' + that.data.screenId + '&page=' + that.data.page,
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: function (res_orders) {
                let current_order = res_orders.data;
                let orders = that.data.orders;
                current_order.forEach(g => {
                    orders.push(g)
                })
                that.setData({
                    orders: orders
                })
                wx.hideToast();
            }
        })
    }
})