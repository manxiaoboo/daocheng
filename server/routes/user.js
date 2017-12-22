const express = require('express');
const router = express.Router();
const User = require('../models/user');
const AuditUser = require('../models/audit_user');
const Role = require('../models/role');
const UUID = require('uuid');
const { makeSalt, encryptPassword, isAuthenticated } = require('../auth/auth.service');
const { auth: { authorization, validation } } = require("../qcloud");

/* GET users listing. */
router.get('/', async (req, res, next) => {
    let validate = await validation(req);
    if (validate.loginState == 1) {
        validate.skey = validate.userinfo.skey;
        let result = {
            code: 0,
            data: validate
        }
        res.json(result);
    }
    else {
        res.json({ err: { message: "loginState is 0" }, code: -1 });
    }
});

router.get('/me', isAuthenticated(), async (req, res, next) => {
    var userId = req.user.id;
      return User.findOne({ id: userId }, '-salt -password')
        .then(user => { // don't ever give out the password or salt
          if (!user) {
            return res.status(401).end();
          }
          res.json(user);
        })
        .catch(err => next(err));
});

router.get('/roles', async (req, res, next) => {
    let roles = await Role.findAll();
    res.json(roles);
});

router.post('/check-audit', (req, res, next) => {
    AuditUser.findOne({
        where: { "userName": req.body.userName }
    })
        .then(user => {
            res.json(user);
        })
});


router.post('/register', (req, res, next) => {
    User.findOne({
        where: { "userName": "admin@dc.com" }
    })
        .then(user => {
            res.json(user);
        })
});

router.post('/audit-user', (req, res, next) => {
    let user = req.body;
    user.id = UUID.v1();
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.role = 'local';
    user.salt = makeSalt();
    encryptPassword(user.password, user.salt, (err, pwd) => {
        user.password = pwd;
        AuditUser.create(user);
        res.json(user);
    });
});

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
