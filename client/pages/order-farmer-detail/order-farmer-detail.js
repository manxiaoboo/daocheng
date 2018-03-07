var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        canShow: false,
        orderId:'',
        me: ''
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
        
    }
})