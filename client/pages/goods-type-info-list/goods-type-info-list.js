var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        canShow: false,
        me: '',
        goods: [],
        type: "",
        page: 1,
        loading: false,
        canShow:false
    },
    onLoad: function (option) {
        this.setData({
            type: option.id
        });
        console.info(option.id)
    },
    onShow: function () {
        console.info("商品分类 => load");
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
        util.showBusy("读取商品");
        wx.request({
            url: config.service.host + '/distributor/goodsSortByType?page=' + that.data.page + '&type=' + that.data.type,
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: function (res_goods) {
                let goods = res_goods.data;
                goods.forEach(g => {
                    if (g.photos) {
                        g.photos_arr = g.photos.split(',')
                    }
                })
                that.setData({
                    goods: goods,
                    canShow: true
                })
                wx.hideToast();
                console.info(goods)
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
            url: config.service.host + '/distributor/goodsSortByType?page=' + that.data.page + '&type=' + that.data.type,
            header: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            success: function (res_goods) {
                let current_goods = res_goods.data;
                let goods = that.data.goods;
                current_goods.forEach(g => {
                    if (g.photos) {
                        g.photos_arr = g.photos.split(',')
                    }
                    goods.push(g)
                })
                that.setData({
                    goods: goods,
                    loading:false
                })
                console.info(goods)
            }
        })
    },
    goDetail: function(e){
        console.info(e)
        wx.redirectTo({
            url: '../distributor-goods-view/distributor-goods-view?id='+ e.currentTarget.dataset.id
          })
    }
})