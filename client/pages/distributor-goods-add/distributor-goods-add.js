var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        input_name: '',
        input_unit: '',
        input_priceStart: '',
        input_priceEnd: '',
        input_Type: '',
        input_intro: '',
        input_specDesc: ''
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
    },
    createGoods:function(e){
        let goods = e.detail.value;
        goods.distributorId = this.data.me.distributor.id;
        let token = wx.getStorageSync('authToken');
        wx.request({
            url: config.service.host + '/distributor/create',
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            method: 'POST',
            data: goods,
            success: function (res_distributor) {
                let newGoods = res_distributor.data;
                wx.navigateTo({
                    url: '../distributor-goods-upload/distributor-goods-upload?id='+newGoods.id
                  })
            }
        })
    },
    doInputName: function (e) {
        this.setData({
            input_name: e.detail.value
        })
    },doInputUnit: function (e) {
        this.setData({
            input_unit: e.detail.value
        })
    },doInputPriceStart: function (e) {
        this.setData({
            input_priceStart: e.detail.value
        })
    },doInputPriceEnd: function (e) {
        this.setData({
            input_priceEnd: e.detail.value
        })
    },doInputType: function (e) {
        this.setData({
            input_Type: e.detail.value
        })
    },doInputIntro: function (e) {
        this.setData({
            input_intro: e.detail.value
        })
    },doInputSpecDesc: function (e) {
        this.setData({
            input_specDesc: e.detail.value
        })
    }
})