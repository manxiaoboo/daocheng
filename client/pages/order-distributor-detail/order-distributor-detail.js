var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        canShow: false,
        order: '',
        orderId: '',
        me: '',
        input_price: '',
        input_count:''
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
                    case 'sent': order.statusName = '未处理'; break;
                    case 'return': order.statusName = '已处理'; break;
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
                  wx.navigateTo({
                    url: '../login/login'
                  })
                }
              }
            });
            return;
          }
        wx.makePhoneCall({
            phoneNumber: this.data.order.farmer.phone,
            success: function () {
                console.log("拨打电话成功！")
            },
            fail: function () {
                console.log("拨打电话失败！")
            }
        })
    },
    doInputCount: function (e) {
        this.setData({
            input_count: e.detail.value
        })
    },
    doInputPrice: function (e) {
        this.setData({
            input_price: e.detail.value
        })
    },
    doReturn: function () {
        let that = this;
        if (!this.data.input_count) {
            util.showModel("提示", "尚未填写数量");
            return;
        }
        if (!this.data.input_price) {
            util.showModel("提示", "尚未填写成交价");
            return;
        }
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '提交确认',
            content: '您确定要将此订单提交回农户吗？',
            confirmText: "提交",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("提交订单");
                    wx.request({
                        url: config.service.host + '/order/returnOrder',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: { id: that.data.order.id, price: that.data.input_price, count:that.data.input_count },
                        success: (res_orders) => {
                           that.onShow()
                        },
                        fail: function (err) {

                        }
                    })
                }
            }
        });
    }
})