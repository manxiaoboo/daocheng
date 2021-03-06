var config = require('../../config')
var util = require('../../utils/util.js')
const qiniuUploader = require("../../utils/qiniuUploader-min.js");

Page({
    data: {
        me: '',
        goodsId: '',
        goods: null,
        isAuditing: false,
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
    onLoad: function (option) {
        var that = this;
        this.setData({
            goodsId: option.id
        });
    },
    onShow: function () {
        console.info("修改商品 => load");
        let that = this;
        let me = wx.getStorageSync('user');
        let roles = wx.getStorageSync('roles');
        roles.forEach(r => {
            if (r.id == me.roleId) {
                me.roleName = r.cName;
            }
        });
        let token = wx.getStorageSync('authToken');
        util.showBusy("读取商品");
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
                wx.request({
                    url: config.service.host + '/distributor/getGoodsById?id=' + that.data.goodsId,
                    header: {
                        'Authorization': 'Bearer ' + token
                    },
                    success: (res_goods) => {
                        if (res_goods.data.photos) {
                            res_goods.data.photos_arr = res_goods.data.photos.split(',')
                        } else {
                            res_goods.data.photos_arr = [];
                        }
                        if (res_goods.data.specDesc) {
                            res_goods.data.specDesc = res_goods.data.specDesc.replace(/：/g, ':')
                            res_goods.data.specDesc = res_goods.data.specDesc.replace(/；/g, ';')
                            res_goods.data.specDesc = res_goods.data.specDesc.split(';')
                        }
                        wx.request({
                            url: config.service.host + '/users/distributorById?distributorId=' + res_goods.data.distributorId,
                            header: {
                                'Authorization': 'Bearer ' + token
                            },
                            success: (res_distributor) => {
                                res_goods.data.distributor = res_distributor.data;
                                wx.request({
                                    url: config.service.host + '/distributor/auditGoodsByGoodsId?id=' + res_goods.data.id,
                                    header: {
                                        'Authorization': 'Bearer ' + token
                                    },
                                    success: (res_audit_goods) => {
                                        let audit_goods = res_audit_goods.data;
                                        types.forEach(t => {
                                            if (t.name == res_goods.data.type_ele.name) {
                                                this.setData({
                                                    input_Type: t.id
                                                })
                                            }
                                        });
                                        let typeIndex = 0;
                                        for (let ti = 0; ti <= pickerTypes.length; ti++) {
                                            if (pickerTypes[ti] == res_goods.data.type_ele.name) {
                                                this.setData({
                                                    typeIndex: ti
                                                })
                                            }
                                        }
                                        console.info(res_goods.data)
                                        that.setData({
                                            me: me,
                                            types: types,
                                            pickerTypes: pickerTypes,
                                            goods: res_goods.data,
                                            isAuditing: audit_goods.length > 0 ? true : false,
                                            input_name: res_goods.data.name,
                                            input_unit: res_goods.data.unit,
                                            input_priceStart: res_goods.data.priceStart,
                                            input_priceEnd: res_goods.data.priceEnd,
                                            input_Type: res_goods.data.type,
                                            input_intro: res_goods.data.intro,
                                            input_specDesc: res_goods.data.specDesc
                                        });
                                        wx.hideToast();
                                        console.info(res_goods.data)
                                        console.info(that.data.goodsId)
                                    },
                                    fail: function (err) {
                                        wx.hideToast();
                                    }
                                })
                            },
                            fail: function (err) {
                                wx.hideToast();
                            }
                        })
                    },
                    fail: function (err) {
                        wx.hideToast();
                    }
                })
            },
            fail: function (err) {
                wx.hideToast();
            }
        })
    },
    deleteImage: function (e) {
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '删除确认',
            content: '您确定要将此图片删除吗？',
            confirmText: "删除",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在处理");
                    console.info(e)
                    wx.request({
                        url: config.service.host + '/qiniu/delete?entry=' + e.currentTarget.id.split('/')[1],
                        header: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        success: function (res) {
                            let goods = that.data.goods;
                            let photos = goods.photos_arr;
                            for (let i = 0; i <= photos.length; i++) {
                                if (photos[i] == e.currentTarget.id) {
                                    photos.splice(i, 1);
                                }
                            }
                            let result = photos.join(',');
                            wx.request({
                                url: config.service.host + '/distributor/updateImage',
                                header: {
                                    'Authorization': 'Bearer ' + token
                                },
                                method: 'POST',
                                data: { images: result, id: that.data.goodsId },
                                success: (res) => {
                                    util.showSuccess("处理成功");
                                    goods.photos = res.data.photos;
                                    that.setData({
                                        goods: goods
                                    })
                                },
                                fail: function (err) {

                                }
                            })
                        },
                        fail: function (err) { }
                    })
                }
            }
        });
    },
    uploadImage: function () {
        let that = this;
        if (this.data.goods.photos_arr && this.data.goods.photos_arr.length >= 9) {
            util.showModel("提示", "最多只能上传9张图片");
            return;
        }
        wx.chooseImage({
            count: 9 - (that.data.goods.photos_arr ? that.data.goods.photos_arr.length : 0),
            success: function (res) {
                that.doUpdate(res, 0)
            }
        });
    },
    doUpdate(chooseRes, index) {
        let that = this;
        let uploadToken = wx.getStorageSync('uploadToken');
        let token = wx.getStorageSync('authToken');
        const filePath = chooseRes.tempFilePaths[index];
        qiniuUploader.upload(filePath, (res) => {
            let goods = that.data.goods;
            goods.photos_arr.push(res.imageURL);
            let result = goods.photos_arr.join(',');
            util.showBusy('正在上传图片');
            wx.request({
                url: config.service.host + '/distributor/updateImage',
                header: {
                    'Authorization': 'Bearer ' + token
                },
                method: 'POST',
                data: { images: result, id: that.data.goodsId },
                success: (res) => {
                    goods.photos = res.data.photos;
                    if (goods.photos) {
                        goods.photos_arr = goods.photos.split(',')
                    }
                    that.setData({
                        goods: goods
                    })
                    if (index < chooseRes.tempFilePaths.length - 1) {
                        that.doUpdate(chooseRes, index + 1);
                    } else {
                        util.showSuccess("处理成功");
                    }

                },
                fail: function (err) {

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
                imgName: new Date().getTime()
            })
    },
    // uploadImage: function () {
    //     if (this.data.goods.photos_arr && this.data.goods.photos_arr.length >= 4) {
    //         util.showModel("提示", "最多只能上传4张图片");
    //         return;
    //     }
    //     let that = this;
    //     let uploadToken = wx.getStorageSync('uploadToken');
    //     let token = wx.getStorageSync('authToken');
    //     wx.chooseImage({
    //         count: 1,
    //         success: function (res) {
    //             var filePath = res.tempFilePaths[0];
    //             qiniuUploader.upload(filePath, (res) => {
    //                 let goods = that.data.goods;
    //                 goods.photos_arr.push(res.imageURL);
    //                 let result = goods.photos_arr.join(',');
    //                 util.showBusy('正在上传图片');
    //                 wx.request({
    //                     url: config.service.host + '/distributor/updateImage',
    //                     header: {
    //                         'Authorization': 'Bearer ' + token
    //                     },
    //                     method: 'POST',
    //                     data: { images: result, id: that.data.goodsId },
    //                     success: (res) => {
    //                         if (index < chooseRes.tempFilePaths.length - 1) {
    //                             that.doUpdate(chooseRes, index + 1);
    //                         } else {
    //                             util.showSuccess("处理成功");
    //                             goods.photos = res.data.photos;
    //                             if (goods.photos) {
    //                                 goods.photos_arr = goods.photos.split(',')
    //                             }
    //                             that.setData({
    //                                 goods: goods
    //                             })
    //                         }

    //                     },
    //                     fail: function (err) {

    //                     }
    //                 })

    //             }, (error) => {
    //                 console.log('error: ' + error);
    //             }, {
    //                     region: 'ECN',
    //                     uploadURL: 'https://up.qbox.me',
    //                     domain: 'p2nrs4i3e.bkt.clouddn.com',
    //                     uptoken: uploadToken,
    //                     fileHead: 'image',
    //                     imgName: new Date().getTime()
    //                 })
    //         }
    //     });
    // },
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
    editGoods: function (e) {
        let that = this;
        let goods = e.detail.value;
        goods.distributorId = this.data.me.distributor.id;
        let token = wx.getStorageSync('authToken');
        goods.type = this.data.input_Type;
        console.info(goods)
        if (!goods.name) {
            util.showModel("提示", "请填写商品名称");
            return;
        }
        if (!goods.unit) {
            util.showModel("提示", "请填写商品单位");
            return;
        }
        if (!goods.priceStart) {
            util.showModel("提示", "请填写最低报价");
            return;
        }
        if (!goods.priceEnd) {
            util.showModel("提示", "请填写最高报价");
            return;
        }
        if (!goods.type) {
            util.showModel("提示", "请选择商品类型");
            return;
        }
        let old_goods = this.data.goods;
        old_goods.name = goods.name;
        old_goods.unit = goods.unit;
        old_goods.priceStart = goods.priceStart;
        old_goods.priceEnd = goods.priceEnd;
        old_goods.type = goods.type;
        old_goods.specDesc = goods.specDesc;
        old_goods.intro = goods.intro;
        if (!old_goods.isAudit && (this.data.me && this.data.me.roleName) == '经销商' && !this.data.isAuditing) {
            wx.showModal({
                title: '修改确认',
                content: '您确定要修改商品信息吗？',
                confirmText: "修改",
                cancelText: "取消",
                success: function (res) {
                    if (res.confirm) {
                        util.showBusy("正在处理");
                        wx.request({
                            url: config.service.host + '/distributor/update',
                            header: {
                                'content-type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            },
                            method: 'POST',
                            data: old_goods,
                            success: function (res) {
                                wx.redirectTo({
                                    url: '../distributor-goods-list/distributor-goods-list'
                                })
                            }
                        })
                    }
                }
            });
        } else {
            wx.showModal({
                title: '提交确认',
                content: '您确定要将此商品的修改提交审核吗？',
                confirmText: "提交",
                cancelText: "取消",
                success: function (res) {
                    if (res.confirm) {
                        util.showBusy("正在处理");
                        const audit_goods = {
                            distributorGoodsId: that.data.goodsId,
                            type: 'update',
                            data: old_goods
                        }
                        wx.request({
                            url: config.service.host + '/distributor/createAuditGoods',
                            header: {
                                'Authorization': 'Bearer ' + token
                            },
                            method: 'POST',
                            data: audit_goods,
                            success: (res) => {
                                that.onShow();
                                util.showSuccess("处理成功");
                                wx.redirectTo({
                                    url: '../distributor-goods-list/distributor-goods-list'
                                })
                            },
                            fail: function (err) {

                            }
                        })
                    }
                }
            });
        }
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