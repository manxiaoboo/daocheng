var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        me: '',
        goodsId: '',
        goods: null,
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        canShow: false
    },
    onLoad: function (option) {
        this.setData({
            goodsId: option.id
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

    }
})