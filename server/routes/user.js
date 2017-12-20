const express = require('express');
const router = express.Router();
const User = require('../models/user');
const UUID = require('uuid');
const { makeSalt, encryptPassword, isAuthenticated } = require('../auth/auth.service');
const { auth: { authorization,validation } } = require("../qcloud");

/* GET users listing. */
router.get('/', async (req, res, next) => {
    let validate = await validation(req);
    if(validate.loginState == 1){
        validate.skey = validate.userinfo.skey;
        let result = {
            code:0,
            data:validate
        }
        res.json(result);
    }else{
        res.status(200).json({err:{message:"loginState is 0"}});
    }
});

router.post('/register', isAuthenticated(), (req, res, next) => {
    res.send("haha");
});

router.post('/initAdmin', (req, res, next) => {
    let user = {
        id: UUID.v1(),
        nickName: "系统管理员",
        password: "daocheng12138",
        userName: "admin@dc.com",
        roleId: "A218AADA-E520-9A83-8F17-19DD3D49DF62",
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
