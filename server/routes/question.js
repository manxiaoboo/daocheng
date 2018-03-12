const express = require('express');
const router = express.Router();
const UUID = require('uuid');
const User = require('../models/user');
const DistributorUser = require('../models/distributorUser');
const DistributorGoods = require('../models/distributorGoods');
const DistributorGoodsType = require('../models/distributorGoodsType');
const AuditGoods = require('../models/audit_goods');
const Order = require('../models/order');
const ExpertUser = require('../models/expertUser');
const Question = require('../models/question')
const Reply = require('../models/reply');
const Domain = require('../models/domain');


const {
    isAuthenticated
} = require('../auth/auth.service');

/**
 * 获取所有问题列表
 */
router.get('/allQuestions', isAuthenticated(), async (req, res, next) => {
    let page = req.query.page;
    let questions = await Question.findAll({
        order: [
            ['createdAt', 'DESC']
        ],
        limit: 5,
        offset: 5 * (page - 1)
    });
    for (const q of questions) {
        aq = q.dataValues
        aq.createUser = await User.findOne({
            where: {
                id: aq.createdBy
            }
        })
    }
    res.json(questions);
});

/**
 * 根据id获取问题
 */
router.get('/question', isAuthenticated(), async (req, res, next) => {
    let id = req.query.id;
    let question = await Question.findOne({
        where: {
            id: id
        }
    });
    aq = question.dataValues
    aq.createUser = await User.findOne({
        where: {
            id: aq.createdBy
        }
    })
    if(aq.acceptUser){
        aq.expert = await ExpertUser.findOne({
            where: {
                id: aq.acceptUser
            }
        })
        aq.expertUser = await User.findOne({
            where: {
                id: aq.expert.userId
            }
        })
    }
    res.json(question);
});

/**
 * 创建一条提问
 */
router.post('/create', isAuthenticated(), async (req, res, next) => {
    let question = req.body;
    question.id = UUID.v1();
    question.status = 'open';
    question.totalView = 0;
    question.createdAt = new Date();
    question.updatedAt = new Date();
    let newquestion = await Question.create(question);
    res.json(newquestion);
});

/**
 * 为提问增加浏览量
 */
router.get('/addView', isAuthenticated(), async (req, res, next) => {
    let id = req.query.id;
    let question = await Question.findOne({
        where: {
            id: id
        }
    });
    aq = question.dataValues;
    aq.totalView = aq.totalView + 1;
    let newquestion = await Question.update(aq,{
        where:{
            id:aq.id
        }
    });
    res.json(newquestion);
});

/**
 * 创建一条回答
 */
router.post('/reply', isAuthenticated(), async (req, res, next) => {
    let reply = req.body;
    reply.id = UUID.v1();
    reply.createdAt = new Date();
    reply.updatedAt = new Date();
    let newreply = await Reply.create(reply);
    if(reply.replyRole == 'expert'){
        let expert = await ExpertUser.findOne({
            where: {
                id: reply.replyUser
            }
        })
        let ae = expert.dataValues;
        ae.score = ae.score + 1;
        await ExpertUser.update(ae,{
            where: {
                id: ae.id
            }
        })
    }
    res.json(newreply);
});

/**
 * 获取某一问题的所有回答
 */
router.get('/allReply', isAuthenticated(), async (req, res, next) => {
    let rootId = req.query.id;
    let replys = await Reply.findAll({
        where:{
            rootId:rootId
        },
        order: [
            ['createdAt', 'DESC']
        ]
    });
    for (const r of replys) {
        ar = r.dataValues;
        if(ar.replyRole == 'farmer' || ar.replyRole == 'admin'){
            ar.replyWith = await User.findOne({
                where: {
                    id: ar.replyUser
                }
            })
        }else if(ar.replyRole == 'expert'){
            ar.replyWith = await ExpertUser.findOne({
                where: {
                    id: ar.replyUser
                }
            })
            ar.replyWith.dataValues.user = await User.findOne({
                where: {
                    id: ar.replyWith.dataValues.userId
                }
            })
            ar.replyWith.dataValues.domain_ele = await Domain.findOne({
                where: {
                    id: ar.replyWith.dataValues.domain
                }
            })
        }
        if(ar.parentId != rootId){
            ar.parent = await Reply.findOne({
                where: {
                    id: ar.parentId
                }
            })
        }
    }
    res.json(replys);
});


module.exports = router;