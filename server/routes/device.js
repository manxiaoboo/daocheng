const express = require('express');
const request = require('request');
const router = express.Router();
const Device = require('../models/device');
const UUID = require('uuid');
const {
    isAuthenticated
} = require('../auth/auth.service');

/**
 * 获取device列表
 */
router.get('/', isAuthenticated(), async (req, res, next) => {
    let devices = await Device.findAll();
    res.json(devices);
});

/**
 * 根据id获取device
 */
router.get('/getDeviceById', isAuthenticated(), async (req, res, next) => {
    let device = await Device.findOne({
        where: {
            id: req.query.deviceId
        }
    });
    res.json(device);
});

/**
 * 获取对应状态的device列表
 */
router.post('/getDevicesByIsUse', isAuthenticated(), async (req, res, next) => {
    let devices = await Device.findAll({
        where: {
            isUse: req.body.isUse
        }
    });
    res.json(devices);
});

/**
 * 创建device
 */
router.post('/create', isAuthenticated(), async (req, res, next) => {
    try {
        let device = req.body;
        device.id = UUID.v1();
        let newDevice = await Device.create(device);
        res.json(newDevice);
    } catch (e) {
        res.status(500).json(e)
    }
});

/**
 * 修改device
 */
router.post('/edit', isAuthenticated(), async (req, res, next) => {
    Device.update(req.body, {
        where: {
            id: req.body.id
        }
    }).then((result) => {
        res.json(result);
    });
});

/**
 * 删除device
 */
router.post('/delete', isAuthenticated(), async (req, res, next) => {
    await Device.destroy({
        where: {
            id: req.body.id
        }
    });
    res.json({});
});


/**
 * 登陆到机智云
 */
router.post('/jzy-login', isAuthenticated(), async (req, res, next) => {
    let term = req.body;
    let options = {
        method: 'post',
        url: 'https://api.gizwits.com/app/login',
        json: true,
        body: { username: term.username, password: term.password },
        headers: {
            'X-Gizwits-Application-Id': term.appid
        }
    };

    request(options, (err, response, body) => {
        if (err) {
            console.log(err);
            res.status(500).send("error");
        } else {
            res.json(body);
        }
    })

});

/**
 * 获取机智云设备最新状态
 */
router.post('/jzy-latest', isAuthenticated(), async (req, res, next) => {
    let term = req.body;
    let options = {
        method: 'get',
        url: 'https://api.gizwits.com/app/devdata/' + term.did + '/latest',
        headers: {
            'X-Gizwits-Application-Id': term.appid,
            'X-Gizwits-User-token': term.userToken
        }
    };

    request(options, (err, response, body) => {
        if (err) {
            console.log(err);
            res.status(500).send('error');
        } else {
            res.json(body);
        }
    })

});

/**
 * 远程操控机智云设备
 */
router.post('/jzy-control', isAuthenticated(), async (req, res, next) => {
    let term = req.body;
    console.log(term);
    let options = {
        method: 'post',
        url: 'https://api.gizwits.com/app/control/' + term.did,
        body: JSON.stringify(term.attrs),
        headers: {
            'X-Gizwits-Application-Id': term.appid,
            'X-Gizwits-User-token': term.userToken
        }
    };

    request(options, (err, response, body) => {
        if (err) {
            console.log(err);
            res.status(500).send("error");
        } else {
            res.json(body);
        }
    })
});


module.exports = router;