const express = require('express');
const router = express.Router();
const UUID = require('uuid');
const DistributorUser = require('../models/distributorUser');
const DistributorGoods = require('../models/distributorGoods');

const {
    isAuthenticated
} = require('../auth/auth.service');

/**
 * 获取当前店铺所有商品
 */
router.get('/', isAuthenticated(), async(req, res, next) => {
    let goods = await DistributorGoods.findAll({
        where: {
            distributorId: req.query.distributorId
        }
    });
    res.json(goods);
});

/**
 * 获取商品
 */
router.get('/getGoodsById', isAuthenticated(), async(req, res, next) => {
    let goods = await DistributorGoods.findOne({
        where: {
            id: req.query.id
        }
    });
    res.json(goods);
});

/**
 * 创建商品
 */
router.post('/create', isAuthenticated(), async(req, res, next) => {
    let goods = req.body;
    goods.id = UUID.v1();
    goods.createdAt = new Date();
    goods.updatedAt = new Date();
    let newgoods = await DistributorGoods.create(goods);
    res.json(newgoods);
});

/**
 * 修改商品
 */
router.post('/update', isAuthenticated(), async(req, res, next) => {
    let goods = req.body;
    let newgoods = await DistributorGoods.update(goods, {
        where: {
            id: goods.id
        }
    });
    res.json(newgoods);
});

/**
 * 删除商品
 */
router.get('/delete', isAuthenticated(), async(req, res, next) => {
    await DistributorGoods.destroy({
        where: {
            id: req.query.id
        }
    });
    res.json({});
});

module.exports = router;