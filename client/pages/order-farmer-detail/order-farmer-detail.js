var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        canShow: false,
        order: '',
        orderId: '',
        me: '',
        input_address: ''
    },
    onLoad: function (option) {
        this.setData({
            orderId: option.id
        });
        console.info(option.id)
    },
    onShow: function () {
        console.info("订单详情 => load");
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
            url: config.service.host + '/order/order?id=' + that.data.orderId,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_orders) => {
                console.info(res_orders.data)
                let order = res_orders.data;
                switch (order.status) {
                    case 'new': order.statusName = '新建'; break;
                    case 'sent': order.statusName = '已发送'; break;
                    case 'return': order.statusName = '待确认'; break;
                    case 'done': order.statusName = '已完成'; break;
                }
                order.createdDate = util.formatTime(new Date(order.createdAt));
                that.setData({
                    order: order,
                    canShow: true
                })
                util.showSuccess("读取成功");
            },
            fail: function (err) {

            }
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
                  wx.redirectTo({
                    url: '../login/login'
                  })
                }
              }
            });
            return;
          }
        wx.makePhoneCall({
            phoneNumber: this.data.order.distributor.contactPhone,
            success: function () {
                console.log("拨打电话成功！")
            },
            fail: function () {
                console.log("拨打电话失败！")
            }
        })
    },
    doInputAddress: function (e) {
        this.setData({
            input_address: e.detail.value
        })
    },
    doSent: function () {
        let that = this;
        if (!this.data.input_address) {
            util.showModel("提示", "尚未填写详细地址");
            return;
        }
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '提交确认',
            content: '您确定要将此订单提交给供应商吗？',
            confirmText: "提交",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("提交订单");
                    wx.request({
                        url: config.service.host + '/order/sentOrder',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: { id: that.data.order.id, address: that.data.input_address },
                        success: (res_orders) => {
                            that.onShow()
                        },
                        fail: function (err) {

                        }
                    })
                }
            }
        });
    },
    doDone: function () {
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '提交确认',
            content: '您确定要将此订单确认完成吗？',
            confirmText: "确认",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("提交订单");
                    wx.request({
                        url: config.service.host + '/order/doneOrder',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: { id: that.data.order.id },
                        success: (res_orders) => {
                            wx.request({
                                url: config.service.host + '/distributor/farmerDeal?id=' + that.data.order.data.id,
                                header: {
                                    'Authorization': 'Bearer ' + token
                                }
                            })
                            that.onShow()
                        },
                        fail: function (err) {

                        }
                    })
                }
            }
        });
    },
    cancle: function(){
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '删除确认',
            content: '您确定要将此订单删除吗？',
            confirmText: "删除",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("删除订单");
                    wx.request({
                        url: config.service.host + '/order/deleteOrder?id='+that.data.order.id,
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        success: (res_orders) => {
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
    }
})