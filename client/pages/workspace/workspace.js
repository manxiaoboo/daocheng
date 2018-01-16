var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        device: '',
        jzyUserToken: '',
        deviceData: {
            "zdpl_led": 0,
            "wd_led": 0,
            "gzjr_led": 0,
            "smg_led": 0,
            "jz_led": 0,
            "sdxh_key": 0,
            "ck_key": 0,
            "jr_led": 0,
            "cy_key": 0,
            "qdjr_led": 0,
            "sj_led": 0,
            "pl_led": 0,
            "jz_key": 0,
            "sdjr_key": 0,
            "qdpl_led": 0,
            "sj_key": 0,
            "cy_led": 0,
            "gy_led": 0,
            "zdxh_key": 0,
            "zdjr_led": 0,
            "zdjr_key": 0,
            "gy_key": 0
        },
        timmer: null
    },
    onLoad: function () {
    },
    onShow: function () {
        console.info("工作台 => load");
        let that = this;
        let me = wx.getStorageSync('user');
        let roles = wx.getStorageSync('roles');
        let jzyUserToken = wx.getStorageSync('jzyUserToken');
        roles.forEach(r => {
            if (r.id == me.roleId) {
                me.roleName = r.cName;
            }
        });
        that.setData({
            me: me,
            jzyUserToken: jzyUserToken.token
        });
        if (me.roleName == '农户' && jzyUserToken) {
            this.refreshDeviceData();
            let timmer = setInterval(() => {
                this.refreshDeviceData();
            }, 5000);
            this.setData({
                timmer: timmer
            });
        }
        console.info(me);
    },
    refreshDeviceData: function () {
        let token = wx.getStorageSync('authToken');
        wx.request({
            url: config.service.host + '/devices/jzy-latest',
            method: 'POST',
            header: {
                'Authorization': 'Bearer ' + token
            },
            data: { userToken: this.data.jzyUserToken, did: this.data.me.device.did, appid: this.data.me.device.appid, username: this.data.me.id, password: this.data.me.id },
            success: (res_latest) => {
                let attr = JSON.parse(res_latest.data);
                if (JSON.stringify(attr.attr) != "{}") {
                    this.setData({
                        deviceData: attr.attr
                    });
                }
            },
            fail: function (err) {

            }
        })
    },
    controlDevice: function (e) {
        console.info(e);
        let type = e.currentTarget.dataset.type;
        let attrs;
        if (type == 'jz_key') {
            let jz_key = this.data.deviceData.jz_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'jz_key': jz_key,
                    'cy_key': jz_key == 1 ? 0 : this.data.deviceData.cy_key
                }
            };
        } else if (type == 'cy_key') {
            let cy_key = this.data.deviceData.cy_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'cy_key': cy_key,
                    'jz_key': cy_key == 1 ? 0 : this.data.deviceData.jz_key
                }
            };
        } else if (type == 'gy_key') {
            let gy_key = this.data.deviceData.gy_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'gy_key': gy_key,
                }
            };
        } else if (type == 'sj_key') {
            let sj_key = this.data.deviceData.sj_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'sj_key': sj_key,
                }
            };
        } else if (type == 'zdjr_key') {
            let zdjr_key = this.data.deviceData.zdjr_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'zdjr_key': zdjr_key,
                    'sdjr_key': zdjr_key == 1 ? 0 : this.data.deviceData.sdjr_key
                }
            };
        } else if (type == 'sdjr_key') {
            let sdjr_key = this.data.deviceData.sdjr_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'sdjr_key': sdjr_key,
                    'zdjr_key': sdjr_key == 1 ? 0 : this.data.deviceData.zdjr_key
                }
            };
        } else if (type == 'zdxh_key') {
            let zdxh_key = this.data.deviceData.zdxh_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'zdxh_key': zdxh_key,
                    'sdxh_key': zdxh_key == 1 ? 0 : this.data.deviceData.sdxh_key
                }
            };
        } else if (type == 'sdxh_key') {
            let sdxh_key = this.data.deviceData.sdxh_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'sdxh_key': sdxh_key,
                    'zdxh_key': sdxh_key == 1 ? 0 : this.data.deviceData.zdxh_key
                }
            };
        }
        let token = wx.getStorageSync('authToken');
        wx.request({
            url: config.service.host + '/devices/jzy-control',
            method: 'POST',
            header: {
                'Authorization': 'Bearer ' + token
            },
            data: { attrs: attrs, userToken: this.data.jzyUserToken, did: this.data.me.device.did, appid: this.data.me.device.appid, username: this.data.me.id, password: this.data.me.id },
            success: (res_latest) => {
                setTimeout(() => {
                    this.refreshDeviceData();
                }, 1000);
            },
            fail: function (err) {

            }
        })

    },
    goEditExpert: function () {
        wx.navigateTo({
            url: '../edit-expert/edit-expert'
        })
    },
    uploadImage:function(){
        wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
              var tempFilePaths = res.tempFilePaths
              console.info(tempFilePaths);
            }
          })
    },
    onHide: function () {
        clearInterval(this.data.timmer);
        this.setData({
            timmer: null
        });
    },
    onUnload: function () {
        clearInterval(this.data.timmer);
        this.setData({
            timmer: null
        });
    }
})