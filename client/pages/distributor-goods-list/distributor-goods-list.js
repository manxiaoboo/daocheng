var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        goods: []
    },
    onLoad: function () {},
    onShow: function () {
        console.info("我的商品 => load");
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
        console.info(that.data.me);
        let token = wx.getStorageSync('authToken');
        wx.request({
            url: config.service.host + '/distributor?distributorId=' + me.distributor.id,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_distributor) => {
                this.setData({
                    goods: res_distributor.data
                });
            },
            fail: function (err) {

            }
        })
    },
    goCreate(){
        wx.navigateTo({
            url: '../distributor-goods-add/distributor-goods-add'
          })
    }
})