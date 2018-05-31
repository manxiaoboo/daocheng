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
router.get('/allQuestions', async (req, res, next) => {
    let page = req.query.page;
    let questions = await Question.findAll({
        order: [
            ['createdAt', 'DESC']
        ],
        limit: 10,
        offset: 10 * (page - 1)
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
 * 获取所有未解决问题列表
 */
router.get('/allOpenQuestions', async (req, res, next) => {
    let page = req.query.page;
    let questions = await Question.findAll({
        where:{
            status: 'open'
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: 10,
        offset: 10 * (page - 1)
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
 * 获取所有被采纳问题列表
 */
router.get('/allAcceptedQuestions', async (req, res, next) => {
    let page = req.query.page;
    let id = req.query.id;
    let questions = await Question.findAll({
        where:{
            status: 'close',
            acceptUser: id
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: 10,
        offset: 10 * (page - 1)
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
 * 获取我的问题列表
 */
router.get('/myQuestions', isAuthenticated(), async (req, res, next) => {
    let page = req.query.page;
    let userId = req.query.id;
    let questions = await Question.findAll({
        where:{
            createdBy:userId
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: 10,
        offset: 10 * (page - 1)
    });
    res.json(questions);
});

/**
 * 根据id获取问题
 */
router.get('/question', async (req, res, next) => {
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
 * 删除一条提问
 */
router.get('/delete', isAuthenticated(), async (req, res, next) => {
    let id = req.query.id;
    await Reply.destroy({
        where:{
            rootId:id
        }
    });
    await Question.destroy({
        where:{
            id:id
        }
    });
    res.json({});
});

/**
 * 采纳回复
 */
router.post('/accept', isAuthenticated(), async (req, res, next) => {
    let question = req.body;
    question.completedAt = new Date();
    question.status = 'close';
    let newquestion = await Question.update(question,{
        where:{
            id:question.id
        }
    });
    let expert = await ExpertUser.findOne({
        where:{
            id: question.acceptUser
        }
    });
    let ae = expert.dataValues;
    ae.score = ae.score + 20;
    ae.accept = ae.accept + 1;
    await ExpertUser.update(ae,{
        where:{
            id: ae.id
        }
    });
    res.json(newquestion);
});

/**
 * 为提问增加浏览量
 */
router.get('/addView', async (req, res, next) => {
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
router.get('/allReply', async (req, res, next) => {
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


/**
 * 获取最近回答
 */
router.get('/recentReply', async (req, res, next) => {
    let page = req.query.page;
    let id = req.query.id;
    let replys = await Reply.findAll({
        where:{
            replyUser:id
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: 10,
        offset: 10 * (page - 1)
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
        if(ar.parentId != id){
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