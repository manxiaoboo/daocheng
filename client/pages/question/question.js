var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        page:1,
        questions:[]
    },
    onLoad: function () {
        console.info("知识问答 => load");
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
        util.showBusy("读取数据");
        wx.request({
            url: config.service.host + '/question/allQuestions?page=' + that.data.page,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_questions) => {
                console.info(res_questions.data)
                let questions = res_questions.data;
                questions.forEach(o => {
                    o.createdDate = util.formatTime(new Date(o.createdAt));
                    if(o.completedAt)o.completedDate = util.formatTime(new Date(o.completedAt));
                })
                that.setData({
                    questions: questions
                })
                wx.hideToast();
            },
            fail: function (err) {

            }
        })
    },
})