var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        input_title:'',
        input_content:''
    },
    onLoad: function () {
        console.info("快速提问 => load");
    },
    onShow: function () {
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
        
    },
    createQuestion: function(e){
        let that = this;
        let question = e.detail.value;
        if(!question.title){
            util.showModel("提示", "请按要求填写标题");
            return;
        }
        if(!question.content){
            util.showModel("提示", "请填写内容");
            return;
        }
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '提交确认',
            content: '您确定要发布此条提问吗？',
            confirmText: "发布",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在发布");
                    question.createdBy = that.data.me.id;
                    wx.request({
                        url: config.service.host + '/question/create',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        data: question,
                        success: (res) => {
                            util.showSuccess("发布成功");
                            wx.navigateBack({
                                delta: 1
                              })
                        },
                        fail: function (err) {

                        }
                    })
                }
            }
        });
    },
    doInputTitle: function(e){
        this.setData({
            input_title: e.detail.value
        })
    },
    doInputContent: function(e){
        this.setData({
            input_content: e.detail.value
        })
    }
})