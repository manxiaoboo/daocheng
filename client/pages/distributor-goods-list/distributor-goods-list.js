var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        canShow: false,
        me: '',
        goods_audit: [],
        goods_unAudit: []
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
        let token = wx.getStorageSync('authToken');
        wx.request({
            url: config.service.host + '/distributor?distributorId=' + me.distributor.id,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_distributor) => {
                let goods_audit = res_distributor.data.filter(rd => {return rd.isAudit})
                let goods_unAudit = res_distributor.data.filter(rd => {return !rd.isAudit})
                goods_audit.forEach(ga => {
                    if(ga.photos){
                        ga.photos_arr = ga.photos.split(',')
                    }
                })
                goods_unAudit.forEach(gu => {
                    if(gu.photos){
                        gu.photos_arr = gu.photos.split(',')
                    }
                })
                this.setData({
                    goods_audit: goods_audit,
                    goods_unAudit: goods_unAudit
                });
                console.info(res_distributor.data)
                this.setData({
                    canShow:true
                })
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