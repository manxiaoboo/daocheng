var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        canShow: false,
        me: '',
        manufacturers:[],
        page: 1,
        loading:false,
        inputShowed: false,
        inputVal: ""
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
            url: config.service.host + '/manufacturer/validateManufacturerUser?page=1',
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_manufacturer) => {
                console.info(res_manufacturer.data)
                this.setData({
                    canShow:true,
                    manufacturers:res_manufacturer.data
                })
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
        that.setData({loading:true})
        wx.request({
            url: config.service.host + '/manufacturer/validateManufacturerUser?page=' + that.data.page,
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: function (res_manufacturer) {
                let current_manufacturer = res_manufacturer.data;
                let manufacturers = that.data.manufacturers;
                current_manufacturer.forEach(cm => {
                    manufacturers.push(cm)
                })
                that.setData({
                    manufacturers: manufacturers,
                    loading:false
                })
                console.info(goods)
            }
        })
    },
})