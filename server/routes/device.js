const express = require('express');
const router = express.Router();
const Device = require('../models/device');
const UUID = require('uuid');
const { isAuthenticated } = require('../auth/auth.service');

/**
 * 获取device列表
 */
router.get('/', isAuthenticated(), async (req, res, next) => {
    let devices = await Device.findAll();
    res.json(devices);
});

/**
 * 创建device
 */
router.post('/create', isAuthenticated(), async (req, res, next) => {
    try{
        let device = req.body;
        device.id = UUID.v1();
        let newDevice = await Device.create(device);
        res.json(newDevice);
    }catch(e){
        res.status(500).json(e)
    }
});

/**
 * 修改device
 */
router.post('/edit', isAuthenticated(), async (req, res, next) => {
    Device.update(req.body,{
        where:{
            id:req.body.id
        }
    }).then((result)=>{
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


module.exports = router;