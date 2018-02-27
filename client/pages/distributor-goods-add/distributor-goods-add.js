var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        types: [],
        pickerTypes: [],
        input_name: '',
        input_unit: '',
        input_priceStart: '',
        input_priceEnd: '',
        input_Type: '',
        input_intro: '',
        input_specDesc: '',
        typeIndex: 0
    },
    onLoad: function () { },
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
        let token = wx.getStorageSync('authToken');
        wx.request({
            url: config.service.host + '/distributor/types',
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_types) => {
                let types = res_types.data;
                let pickerTypes = [];
                types.forEach(t => {
                    pickerTypes.push(t.name)
                })
                that.setData({
                    types: types,
                    pickerTypes: pickerTypes,
                    me: me
                })
            },
            fail: function (err) {

            }
        })
    },
    typeChange: function (e) {
        let name = this.data.pickerTypes[e.detail.value];
        this.data.types.forEach(t => {
            if (t.name == name) {
                this.setData({
                    input_Type: t.id
                })
            }
        });
        this.setData({
            typeIndex: e.detail.value
        })
    },
    createGoods: function (e) {
        let goods = e.detail.value;
        goods.distributorId = this.data.me.distributor.id;
        let token = wx.getStorageSync('authToken');
        goods.type = this.data.input_Type;
        if(!goods.name){
            util.showModel("提示", "请填写商品名称");
            return;
        }
        if(!goods.unit){
            util.showModel("提示", "请填写商品单位");
            return;
        }
        if(!goods.priceStart){
            util.showModel("提示", "请填写最低报价");
            return;
        }
        if(!goods.priceEnd){
            util.showModel("提示", "请填写最高报价");
            return;
        }
        if(!goods.type){
            util.showModel("提示", "请选择商品类型");
            return;
        }
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
                    url: '../distributor-goods-upload/distributor-goods-upload?id=' + newGoods.id
                })
            }
        })
    },
    doInputName: function (e) {
        this.setData({
            input_name: e.detail.value
        })
    }, doInputUnit: function (e) {
        this.setData({
            input_unit: e.detail.value
        })
    }, doInputPriceStart: function (e) {
        this.setData({
            input_priceStart: e.detail.value
        })
    }, doInputPriceEnd: function (e) {
        this.setData({
            input_priceEnd: e.detail.value
        })
    }, doInputType: function (e) {
        this.setData({
            input_Type: e.detail.value
        })
    }, doInputIntro: function (e) {
        this.setData({
            input_intro: e.detail.value
        })
    }, doInputSpecDesc: function (e) {
        this.setData({
            input_specDesc: e.detail.value
        })
    }
})