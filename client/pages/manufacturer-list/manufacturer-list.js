var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
        canShow: false,
        me: '',
        manufacturers:[]
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
            url: config.service.host + '/manufacturer/validateManufacturerUser',
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
    }
})