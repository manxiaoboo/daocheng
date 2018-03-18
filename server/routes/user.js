const express = require('express');
const router = express.Router();
const QcloudSms = require("qcloudsms_js");
const User = require('../models/user');
const AuditUser = require('../models/audit_user');
const AuditUserDone = require('../models/audit_user_done');
const Role = require('../models/role');
const ExpertUser = require('../models/expertUser');
const Domain = require('../models/domain');
const DistributorUser = require('../models/distributorUser');
const DistributorGoods = require('../models/distributorGoods');
const AuditGoods = require('../models/audit_goods');

const UUID = require('uuid');
const {
    makeSalt,
    encryptPassword,
    isAuthenticated
} = require('../auth/auth.service');
const {
    auth: {
        authorization,
        validation
    }
} = require("../qcloud");



/**
 * 发送验证码
 */
router.post('/sendCode', async (req, res, next) => {
    const appid = 1400056903;
    const appkey = "4072f0e22d49df1d605dc1a4c2a2fd4c";
    const templId = 94676;
    const qcloudsms = QcloudSms(appid, appkey);
    const params = [req.body.code];
    const ssender = qcloudsms.SmsSingleSender();
    ssender.sendWithParam(86, req.body.phone, templId,
        params, "", "", "", callback);

    function callback(err, res_m, resData) {
        if (err)
            console.log("err: ", err);
        else
            res.json({});
    }
});

/**
 * 校验微信用户信息状态并返回
 */
router.get('/', async (req, res, next) => {
    let validate = await validation(req);
    if (validate.loginState == 1) {
        validate.skey = validate.userinfo.skey;
        let result = {
            code: 0,
            data: validate
        }
        res.json(result);
    } else {
        res.json({
            err: {
                message: "loginState is 0"
            },
            code: -1
        });
    }
});


/**
 * platform端dashboard数据集合
 */
router.get('/dashboard', isAuthenticated(), async (req, res, next) => {
    let result = {
        counts:{},
        distributors:[],
        auditUsers:[],
        auditGoods:[]
    };
    result.counts.expert = await ExpertUser.count();
    result.counts.farmer = await User.count({where:{roleId:'27ea4974-e6c4-11e7-b42e-060400ef5315'}});
    result.counts.distributor = await DistributorUser.count();
    result.distributors = await DistributorUser.findAll({limit: 6,order: [['createdAt', 'DESC']]});
    result.auditUsers = await AuditUser.findAll({limit: 3,order: [['createdAt', 'DESC']]});
    result.auditGoods = await AuditGoods.findAll({limit: 3,order: [['createdAt', 'DESC']]});
    for (const ag of result.auditGoods) {
        let g = ag.dataValues;
        g.goods = await DistributorGoods.findOne({
            where:{
                id:g.distributorGoodsId
            }
        });
        g.goods.dataValues.distributor = await DistributorUser.findOne({
            where:{
                id:g.goods.dataValues.distributorId
            }
        });
    }
    res.json(result);
});

/**
 * 根据id获取用户
 */
router.get('/getUser', isAuthenticated(), async (req, res, next) => {
    let user = await User.findOne({
        where: {
            id: req.query.userId
        }
    });
    res.json(user);
});

/**
 * 根据用户名和手机号获取用户
 */
router.get('/getUserByNameAndPhone', async (req, res, next) => {
    let user = await User.findOne({
        where: {
            userName: req.query.userName,
            phone:req.query.phone,
            roleId:{
                $ne: '2cf27ea0-e6c4-11e7-b42e-060400ef5315'
            }
        }
    });
    res.json(user);
});

/**
 * 修改密码
 */
router.post('/changePassword', async (req, res, next) => {
    let user = req.body.user;
    let newpass = req.body.password;
    encryptPassword(newpass, user.salt, async (err, pwd) => {
        user.password = pwd;
        await User.update(user,{
            where:{
                id: user.id
            }
        });
        res.json(user);
    });
});

/**
 * 获取当前登陆用户
 */
router.get('/me', isAuthenticated(), async (req, res, next) => {
    let userId = req.user.id;
    let query = {
        id: userId
    }
    let roleId = req.query.roleId;
    if (roleId && roleId != 'other') query.roleId = roleId;
    if (roleId == 'other') query.roleId = {
        $ne: '2cf27ea0-e6c4-11e7-b42e-060400ef5315'
    };
    return User.findOne({
            where: query
        }, '-salt -password')
        .then(user => { // don't ever give out the password or salt
            if (!user) {
                return res.status(401).end();
            }
            res.json(user);
        })
        .catch(err => next(err));
});

/**
 * 获取所有身份
 */
router.get('/roles', async (req, res, next) => {
    let roles = await Role.findAll({
        'order': [
            ['position', 'ASC']
        ]
    });
    res.json(roles);
});

/**
 * 获取账户的待审核信息
 */
router.post('/check-audit', (req, res, next) => {
    AuditUser.findOne({
            where: {
                "userName": req.body.userName
            }
        })
        .then(user => {
            res.json(user);
        })
});

/**
 * 修改用户信息
 */
router.post('/user-edit', isAuthenticated(), (req, res, next) => {
    User.update(req.body, {
        where: {
            id: req.body.id
        }
    }).then((result) => {
        res.json(result);
    });
});

/**
 * 正式注册用户
 */
router.post('/register', isAuthenticated(), async (req, res, next) => {
    let audit_user = req.body;
    let user = {
        id: UUID.v1(),
        nickName: audit_user.nickName,
        password: audit_user.password,
        userName: audit_user.userName,
        roleId: audit_user.roleId,
        role: "local",
        province: audit_user.province,
        city: audit_user.city,
        area: audit_user.area,
        isValidate: 0,
        picture: audit_user.picture,
        phone: audit_user.phone,
        openId: audit_user.openId,
        salt: audit_user.salt,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    let newUser = await User.create(user);
    let audit_user_done = {
        id: UUID.v1(),
        nickName: audit_user.nickName,
        password: audit_user.password,
        userName: audit_user.userName,
        roleId: audit_user.roleId,
        role: "local",
        province: audit_user.province,
        city: audit_user.city,
        area: audit_user.area,
        isValidate: 0,
        picture: audit_user.picture,
        phone: audit_user.phone,
        openId: audit_user.openId,
        salt: audit_user.salt,
        auditUserId: req.query.userId,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    await AuditUserDone.create(audit_user_done);
    await AuditUser.destroy({
        where: {
            id: audit_user.id
        }
    });
    //如果是专家 为其创建专属身份
    if (audit_user.roleId == '33aba88e-e6c4-11e7-b42e-060400ef5315') {
        let expert = {
            id: UUID.v1(),
            userId: newUser.id,
            name: '',
            score: 0,
            level: 1,
            domain: '',
            intro: '',
            accept: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        await ExpertUser.create(expert);
    }

    //如果是经销商 为其创建专属身份
    if (audit_user.roleId == '304414ba-e6c4-11e7-b42e-060400ef5315') {
        let distributor = {
            id: UUID.v1(),
            userId: newUser.id,
            address: '',
            intro: '',
            contact: '',
            contactPhone: '',
            createdAt: new Date(),
            updatedAt: new Date()
        }
        await DistributorUser.create(distributor);
    }

    res.json(newUser);
});

/**
 * 创建待审核用户
 */
router.post('/audit-user', (req, res, next) => {
    let user = req.body;
    user.id = UUID.v1();
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.role = 'local';
    user.salt = makeSalt();
    encryptPassword(user.password, user.salt, async (err, pwd) => {
        user.password = pwd;
        await AuditUser.create(user);
        res.json(user);
    });
});

/**
 * 拒绝审核申请
 */
router.post('/audit-user-reject', isAuthenticated(), async (req, res, next) => {
    let audit_user = req.body;
    await AuditUser.destroy({
        where: {
            id: audit_user.id
        }
    });
    res.json({});
});

/**
 * 根据身份获取所有用户信息
 */
router.get('/all-user', isAuthenticated(), async (req, res, next) => {
    let roleId = req.query.roleId;
    let query = {};
    if (roleId) query.roleId = roleId;
    let users = await User.findAll({
        where: query,
        order: [
            ['updatedAt', 'DESC']
        ]
    });
    res.json(users);
});

/**
 * 获取所有待审核用户
 */
router.get('/all-audit-user', isAuthenticated(), async (req, res, next) => {
    let audit_users = await AuditUser.findAll({
        order: [
            ['updatedAt', 'DESC']
        ]
    });
    res.json(audit_users);
});

/**
 * 获取所有已审核用户
 */
router.get('/all-audit-user-done', isAuthenticated(), async (req, res, next) => {
    let audit_users_done = await AuditUserDone.findAll({
        order: [
            ['updatedAt', 'DESC']
        ]
    });
    res.json(audit_users_done);
});

/**
 * 获取所有专业领域信息
 */
router.get('/all-domain', isAuthenticated(), async (req, res, next) => {
    let domains = await Domain.findAll({
        order: [
            ['updatedAt', 'DESC']
        ]
    });
    res.json(domains);
});

/**
 * 新建专业领域信息
 */
router.post('/create-domain', isAuthenticated(), async (req, res, next) => {
    let domain = req.body;
    domain.id = UUID.v1();
    domain.createdAt = new Date();
    domain.updatedAt = new Date();
    await Domain.create(domain);
    res.json({});
});

/**
 * 修改专业领域信息
 */
router.post('/edit-domain', isAuthenticated(), async (req, res, next) => {
    let domain = req.body;
    await Domain.update(domain, {
        where: {
            id: domain.id
        }
    });
    res.json({});
});

/**
 * 删除专业领域信息
 */
router.post('/delete-domain', isAuthenticated(), async (req, res, next) => {
    let domain = req.body;
    await Domain.destroy({
        where: {
            id: domain.id
        }
    });
    res.json({});
});

/**
 * 根据userId获取专家信息
 */
router.get('/expertByUserId', isAuthenticated(), async (req, res, next) => {
    let expert = await ExpertUser.findOne({
        where: {
            userId: req.query.userId
        }
    });
    res.json(expert);
});

/**
 * 修改专家信息
 */
router.post('/expert-edit', isAuthenticated(), (req, res, next) => {
    ExpertUser.update(req.body, {
        where: {
            id: req.body.id
        }
    }).then((result) => {
        res.json(result);
    });
});

/**
 * 根据userId获取经销商信息
 */
router.get('/distributorByUserId', isAuthenticated(), async (req, res, next) => {
    let distributor = await DistributorUser.findOne({
        where: {
            userId: req.query.userId
        }
    });
    res.json(distributor);
});

/**
 * 根据id获取经销商信息
 */
router.get('/distributorById', isAuthenticated(), async (req, res, next) => {
    let distributor = await DistributorUser.findOne({
        where: {
            id: req.query.distributorId
        }
    });
    res.json(distributor);
});

/**
 * 修改经销商信息
 */
router.post('/distributor-edit', isAuthenticated(), (req, res, next) => {
    DistributorUser.update(req.body, {
        where: {
            id: req.body.id
        }
    }).then((result) => {
        res.json(result);
    });
});


/**
 * 初始化一个管理员
 */
router.post('/initAdmin', (req, res, next) => {
    let user = {
        id: UUID.v1(),
        nickName: "系统管理员",
        password: "daocheng12138",
        userName: "admin@dc.com",
        roleId: "2cf27ea0-e6c4-11e7-b42e-060400ef5315",
        role: "local",
        province: "黑龙江省",
        city: "哈尔滨市",
        area: "道里区",
        isValidate: 1,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    user.salt = makeSalt();
    encryptPassword(user.password, user.salt, (err, pwd) => {
        user.password = pwd;
        User.create(user);
        res.json(user);
    });
});


module.exports = router;