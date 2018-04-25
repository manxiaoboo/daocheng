var config = require('../../config')
var util = require('../../utils/util.js')
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
    data: {
        canShow: false,
        me: '',
        goods:[],
        goods_deleted:[],
        tabs: ["产品", "回收站"],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0
    },
    onLoad: function () {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                });
            }
        });
    },
    onShow: function () {
        console.info("我的产品 => load");
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
            url: config.service.host + '/manufacturer?manufacturerId=' + me.manufacturer.id,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_manufacturer) => {
                let goods_deleted = res_manufacturer.data.filter(rd => {return rd.isDelete})
                let goods = res_manufacturer.data.filter(rd => {return !rd.isDelete})
                goods_deleted.forEach(ga => {
                    if(ga.photos){
                        ga.photos_arr = ga.photos.split(',')
                    }
                })
                goods.forEach(gu => {
                    if(gu.photos){
                        gu.photos_arr = gu.photos.split(',')
                    }
                })
                this.setData({
                    goods_deleted: goods_deleted,
                    goods: goods,
                });
                console.info(res_manufacturer.data)
                this.setData({
                    canShow:true
                })
            },
            fail: function (err) {

            }
        })
    },
    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
    },
    goCreate(){
        wx.navigateTo({
            url: '../manufacturer-goods-add/manufacturer-goods-add'
          })
    }
})