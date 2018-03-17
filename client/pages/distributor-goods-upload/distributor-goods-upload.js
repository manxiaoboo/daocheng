var config = require('../../config')
var util = require('../../utils/util.js')
const qiniuUploader = require("../../utils/qiniuUploader-min.js");


Page({
    data: {
        me: '',
        goodsId:'',
        goods:null
    },
    onLoad: function (option) {
        this.setData({
            goodsId:option.id
        });
    },
    onShow: function () {
        console.info("上传图片 => load");
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
                that.setData({
                    me: me,
                    goods:res_goods.data
                });
            },
            fail: function (err) {

            }
        })
        
    },
    uploadImage:function(){
        if(this.data.goods.photos && this.data.goods.photos.length >= 4){
            util.showModel("提示","最多只能上传4张图片");
            return;
        }
        let that = this;
        let uploadToken = wx.getStorageSync('uploadToken');
        let token = wx.getStorageSync('authToken');
        wx.chooseImage({
            count: 1,
            success: function (res) {
                var filePath = res.tempFilePaths[0];
                qiniuUploader.upload(filePath, (res) => {
                    let goods = that.data.goods;
                    if(!goods.photos){
                        goods.photos = [];
                    }
                    goods.photos.push(res.imageURL);
                    let oldphotos = goods.photos;
                    goods.photos = goods.photos.toString();
                    console.info("manxiaoboo",goods.photos);
                    util.showBusy('正在上传图片');
                    wx.request({
                        url: config.service.host + '/distributor/update',
                        header: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: goods,
                        success: function (res_distributor) {
                            goods.photos = oldphotos;
                            that.setData({
                                goods: goods
                            });
                            util.showSuccess("图片上传成功");
                        },
                        fail: function (err) {
                            util.showModel("失败", "图片上传失败");
                        }
                    })
                }, (error) => {
                    console.log('error: ' + error);
                }, {
                    region: 'ECN',
                    uploadURL: 'https://up.qbox.me',
                    domain: 'p2nrs4i3e.bkt.clouddn.com',
                    uptoken: uploadToken,
                    fileHead: 'image',
                    imgName:new Date().getTime()
                })
            }
        });
    },
    finish:function(){
        wx.redirectTo({
            url: '../distributor-goods-list/distributor-goods-list'
        })
    }
})