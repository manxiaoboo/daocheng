var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        domains: [],
        pickerDomains: [],
        domainIndex: 0,
        input_name: '',
        input_domain: '',
        input_intro: ''
    },
    onLoad: function () {
        console.info("修改专业信息 => load");
        var that = this;
        wx.getStorage({
            key: 'user',
            success: function (res) {
                let me = res.data;
                wx.getStorage({
                    key: 'roles',
                    success: function (res_roles) {
                        let roles = res_roles.data;
                        roles.forEach(r => {
                            if (r.id == me.roleId) {
                                me.roleName = r.cName;
                            }
                        });
                        let domains = wx.getStorageSync('domains');
                        let pickerDomains = [];
                        domains.forEach((r) => {
                            pickerDomains.push(r.name);
                        })
                        domains.forEach((r,index) => {
                            if(r.id == me.expert.domain){
                                that.setData({
                                    domainIndex:index
                                })
                            }
                        })
                        that.setData({
                            me: me,
                            domains: domains,
                            pickerDomains: pickerDomains,
                            input_name: me.expert.name,
                            input_intro: me.expert.intro
                        });
                        console.info(that.data.me);
                        console.info(domains);
                    }
                })
            }
        })
    },
    editExpert: function (e) {
        let that = this;
        let me = this.data.me;
        me.expert.domain = this.data.input_domain;
        me.expert.intro = this.data.input_intro;
        me.expert.name = this.data.input_name;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '修改确认',
            content: '您确定已经检查信息并修改吗？',
            confirmText: "确认修改",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在修改信息，请稍等");
                    wx.request({
                        url: config.service.host + '/users/expert-edit',
                        header: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: me.expert,
                        success: function (res_expert) {
                            wx.setStorageSync('user', me);
                            wx.reLaunch({
                                url: '../dashboard/dashboard'
                            })
                        },
                        fail: function (err) {
                            wx.navigateBack({
                                delta: 1
                            })
                        }
                    })
                }
            }
        });
    },
    domainChange: function (e) {
        let name = this.data.pickerDomains[e.detail.value];
        this.data.domains.forEach(r => {
            if (r.name == name) {
                this.setData({
                    input_domain: r.id
                })
            }
        });
        this.setData({
            domainIndex: e.detail.value
        })
    },
    doInputName: function (e) {
        this.setData({
            input_name: e.detail.value
        })
    },
    doInputIntro: function (e) {
        this.setData({
            input_intro: e.detail.value
        })
    }

})