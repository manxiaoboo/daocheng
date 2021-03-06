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
        timmer: null,
        lock: false
    },
    onLoad: function () {},
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
        if (me.roleName == '专家') {
            let domains = wx.getStorageSync('domains');
            domains.forEach(d => {
                if (me.expert.domain == d.id) {
                    me.expert.domainName = d.name;
                }
            })
        }
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
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.request({
            url: config.service.host + '/devices/jzy-latest',
            method: 'POST',
            header: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                userToken: this.data.jzyUserToken,
                did: this.data.me.device.did,
                appid: this.data.me.device.appid,
                username: this.data.me.id,
                password: this.data.me.id
            },
            success: (res_latest) => {
                let attr = JSON.parse(res_latest.data);
                let old_attr = that.data.deviceData;

                if (JSON.stringify(attr.attr) != "{}") {
                    attr.attr.cy_key = attr.attr.cy_led;
                    attr.attr.jz_key = attr.attr.jz_led;
                    attr.attr.gy_key = attr.attr.gy_led;
                    attr.attr.sj_key = attr.attr.sj_led;
                    attr.attr.zdjr_key = attr.attr.zdjr_led;
                    attr.attr.sdjr_key = attr.attr.qdjr_led;
                    attr.attr.zdxh_key = attr.attr.zdpl_led;
                    attr.attr.sdxh_key = attr.attr.qdpl_led;
                    this.setData({
                        deviceData: attr.attr
                    });
                }
                // if (JSON.stringify(old_attr) != JSON.stringify(that.data.deviceData)) {
                //     that.setData({
                //         lock: false
                //     })
                //     wx.hideToast();
                // }

            },
            fail: function (err) {

            }
        })
    },
    controlDevice: function (e) {
        return;
        console.info(e);
        let type = e.currentTarget.dataset.type;
        let attrs;
        if (type == 'jz_key') {
            if (this.data.deviceData.jz_key == 1) return;
            let jz_key = this.data.deviceData.jz_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'jz_key': jz_key
                }
            };
        } else if (type == 'cy_key') {
            if (this.data.deviceData.cy_key == 1) return;
            let cy_key = this.data.deviceData.cy_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'cy_key': cy_key
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
                    'zdjr_key': zdjr_key
                }
            };
        } else if (type == 'sdjr_key') {
            let sdjr_key = this.data.deviceData.sdjr_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'sdjr_key': sdjr_key
                }
            };
        } else if (type == 'zdxh_key') {
            let zdxh_key = this.data.deviceData.zdxh_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'zdxh_key': zdxh_key
                }
            };
        } else if (type == 'sdxh_key') {
            let sdxh_key = this.data.deviceData.sdxh_key == 0 ? 1 : 0;
            attrs = {
                'attrs': {
                    'sdxh_key': sdxh_key
                }
            };
        }
        let token = wx.getStorageSync('authToken');
        if (type == 'jz_key' || type == 'cy_key') {
            let close_key = null;
            if (type == 'jz_key' && this.data.deviceData.jz_key == 0) {
                close_key = {
                    'attrs': {
                        'cy_key': 0
                    }
                }
            }
            if (type == 'cy_key' && this.data.deviceData.cy_key == 0) {
                close_key = {
                    'attrs': {
                        'jz_key': 0
                    }
                }
            }
            if (close_key) {
                this.preControl(close_key, attrs, token)
            } else {
                this.control(attrs, token);
            }
        } else if (type == 'zdjr_key' || type == 'sdjr_key') {
            let close_key = null;
            if (type == 'zdjr_key' && this.data.deviceData.zdjr_key == 0) {
                close_key = {
                    'attrs': {
                        'sdjr_key': 0
                    }
                }
            }
            if (type == 'sdjr_key' && this.data.deviceData.sdjr_key == 0) {
                close_key = {
                    'attrs': {
                        'zdjr_key': 0
                    }
                }
            }
            if (close_key) {
                this.preControl(close_key, attrs, token)
            } else {
                this.control(attrs, token);
            }

        } else if (type == 'zdxh_key' || type == 'sdxh_key') {
            let close_key = null;
            if (type == 'zdxh_key' && this.data.deviceData.zdxh_key == 0) {
                close_key = {
                    'attrs': {
                        'sdxh_key': 0
                    }
                }
            }
            if (type == 'sdxh_key' && this.data.deviceData.sdxh_key == 0) {
                close_key = {
                    'attrs': {
                        'zdxh_key': 0
                    }
                }
            }
            if (close_key) {
                this.preControl(close_key, attrs, token)
            } else {
                this.control(attrs, token);
            }

        } else {
            this.control(attrs, token);
        }
    },
    preControl: function (close_key, attrs, token) {
        let that = this
        util.showBusy('正在发送指令')
        that.setData({
            lock: true
        })
        wx.request({
            url: config.service.host + '/devices/jzy-control',
            method: 'POST',
            header: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                attrs: close_key,
                userToken: this.data.jzyUserToken,
                did: this.data.me.device.did,
                appid: this.data.me.device.appid,
                username: this.data.me.id,
                password: this.data.me.id
            },
            success: (res_latest) => {
                setTimeout(()=>{
                    that.control(attrs, token);
                },10000)
            },
            fail: function (err) {

            }
        })
    },
    control: function (attrs, token) {
        let that = this
        util.showBusy('正在发送指令')
        that.setData({
            lock: true
        })
        wx.request({
            url: config.service.host + '/devices/jzy-control',
            method: 'POST',
            header: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                attrs: attrs,
                userToken: this.data.jzyUserToken,
                did: this.data.me.device.did,
                appid: this.data.me.device.appid,
                username: this.data.me.id,
                password: this.data.me.id
            },
            success: (res_latest) => {},
            fail: function (err) {

            }
        })
    },
    goEditExpert: function () {
        wx.navigateTo({
            url: '../edit-expert/edit-expert'
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