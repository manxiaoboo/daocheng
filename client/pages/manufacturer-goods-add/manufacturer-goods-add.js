var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        types: [],
        pickerTypes: [],
        input_name: '',
        input_Type: '',
        input_intro: '',
        typeIndex: 0
    },
    onLoad: function () { },
    onShow: function () {
        console.info("创建产品 => load");
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
        goods.manufacturerId = this.data.me.manufacturer.id;
        let token = wx.getStorageSync('authToken');
        goods.type = this.data.input_Type;
        if(!goods.name){
            util.showModel("提示", "请填写商品名称");
            return;
        }
        if(!goods.type){
            util.showModel("提示", "请选择商品类型");
            return;
        }
        wx.request({
            url: config.service.host + '/manufacturer/create',
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            method: 'POST',
            data: goods,
            success: function (res_manufacturer) {
                let newGoods = res_manufacturer.data;
                wx.navigateTo({
                    url: '../manufacturer-goods-upload/manufacturer-goods-upload?id=' + newGoods.id
                })
            }
        })
    },
    doInputName: function (e) {
        this.setData({
            input_name: e.detail.value
        })
    }, 
    doInputType: function (e) {
        this.setData({
            input_Type: e.detail.value
        })
    }, 
    doInputIntro: function (e) {
        this.setData({
            input_intro: e.detail.value
        })
    }
})