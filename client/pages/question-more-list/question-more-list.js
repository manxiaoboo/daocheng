var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        page:1,
        questions:[],
        loading:false

    },
    onLoad: function () {
        console.info("我的提问 => load");
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
            me: me,
            page:1
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
            url: config.service.host + '/question/allQuestions?page=' + that.data.page,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_questions) => {
                let old_question = that.data.questions;
                let questions = res_questions.data;
                questions.forEach(o => {
                    o.createdDate = util.formatTime(new Date(o.createdAt));
                    if(o.completedAt)o.completedDate = util.formatTime(new Date(o.completedAt));
                    old_question.push(o)
                })
                that.setData({
                    questions: old_question,
                    loading:false
                })
            },
            fail: function (err) {

            }
        })
    }
})