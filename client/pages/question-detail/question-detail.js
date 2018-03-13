var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        page: 1,
        question: '',
        questionId: '',
        replys:[],
        reply_parent:'',
        reply_placeholder:'添加回复...',
        reply_content:'',
        reply_focus: false
        
    },
    onLoad: function (option) {
        console.info("问答详情 => load");
        var that = this;
        this.setData({
            questionId: option.id
        });
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
        console.info(me)
        let token = wx.getStorageSync('authToken');
        util.showBusy("读取数据");
        wx.request({
            url: config.service.host + '/question/question?id=' + that.data.questionId,
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res_question) => {
                console.info(res_question.data)
                let question = res_question.data;
                question.createdDate = util.formatTime(new Date(question.createdAt));
                if (question.completedAt) question.completedDate = util.formatTime(new Date(question.completedAt));
                that.setData({
                    question: question
                })
                wx.hideToast();
                util.showBusy("读取回复");
                wx.request({
                    url: config.service.host + '/question/allReply?id=' + that.data.questionId,
                    header: {
                        'Authorization': 'Bearer ' + token
                    },
                    success: (res_replys) => {
                        console.info(res_replys.data)
                        let replys = res_replys.data;
                        replys.forEach(r =>{
                            r.createdDate = util.formatTime(new Date(r.createdAt));
                            if(r.parent)r.parent.content = r.parent.content.slice(0,20) + '...';
                        })
                        that.setData({
                            replys: replys
                        })
                        wx.hideToast();
                    },
                    fail: function (err) {
        
                    }
                })
            },
            fail: function (err) {

            }
        })
        setTimeout(()=>{
            wx.request({
                url: config.service.host + '/question/addView?id='+that.data.questionId,
                header: {
                    'Authorization': 'Bearer ' + token
                },
                success: (res_question) => {
                },
                fail: function (err) {
                }
            })
        },5000)
    },
    replyRoot: function(){
        this.setData({
            reply_placeholder:'回复题主...',
            reply_parent: this.data.question.id,
            reply_focus: true
        })
    },
    replyOther: function(e){
        console.info(e)
        let parentId = e.currentTarget.dataset.id;
        this.setData({
            reply_placeholder:'@'+e.currentTarget.dataset.name+'...',
            reply_parent: parentId,
            reply_focus: true
        })
    },
    replyBlur: function(e){
    },
    doReply: function(){
        let that = this;
        let token = wx.getStorageSync('authToken');
        if(!this.data.reply_content){
            util.showModel("提示", "请填写回复内容");
            return;
        }
        let reply = {};
        reply.content = this.data.reply_content;
        if(!this.data.reply_parent){
            reply.parentId = this.data.question.id;
        }else{
            reply.parentId = this.data.reply_parent;
        }
        reply.rootId =this.data.question.id;

        if(this.data.me.roleName == '专家'){
            reply.replyUser = this.data.me.expert.id;
        }else{
            reply.replyUser = this.data.me.id;
        }
        
        switch(this.data.me.roleName){
            case '农户': reply.replyRole = 'farmer';break;
            case '专家': reply.replyRole = 'expert';break;
            case '系统管理员': reply.replyRole = 'admin';break;
        }
        wx.request({
            url: config.service.host + '/question/reply',
            header: {
                'Authorization': 'Bearer ' + token
            },
            method:'POST',
            data: reply,
            success: (res_question) => {
                that.setData({
                        reply_placeholder:'添加回复...',
                        reply_parent: '',
                        reply_focus: false,
                        reply_content:''
                    })
                that.onShow();
            },
            fail: function (err) {

            }
        })
    },
    accept: function(e){
        let that = this;
        let token = wx.getStorageSync('authToken');
        let expert = e.currentTarget.dataset.expert;
        let reply = e.currentTarget.dataset.reply;
        let question = this.data.question;
        question.acceptId = reply.id;
        question.acceptUser = expert.id;
        wx.showModal({
            title: '采纳确认',
            content: '您确定要采纳此条回复吗？',
            confirmText: "采纳",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在处理");
                    wx.request({
                        url: config.service.host + '/question/accept',
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        method:'POST',
                        data: question,
                        success: (res_question) => {
                            that.setData({
                                    reply_placeholder:'添加回复...',
                                    reply_parent: '',
                                    reply_focus: false,
                                    reply_content:''
                                })
                            that.onShow();
                        },
                        fail: function (err) {
                        }
                    })
                }
            }
        });
    },
    deleteQuestion: function(){
        let that = this;
        let token = wx.getStorageSync('authToken');
        wx.showModal({
            title: '删除确认',
            content: '您确定要删除此条提问吗？',
            confirmText: "删除",
            cancelText: "取消",
            success: function (res) {
                if (res.confirm) {
                    util.showBusy("正在删除");
                    wx.request({
                        url: config.service.host + '/question/delete?id='+that.data.question.id,
                        header: {
                            'Authorization': 'Bearer ' + token
                        },
                        success: (res_question) => {
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
    doInputReply: function(e){
        this.setData({
            reply_content: e.detail.value
        })
    }
})