const express = require('express');
const router = express.Router();
const UUID = require('uuid');
const DistributorUser = require('../models/distributorUser');
const DistributorGoods = require('../models/distributorGoods');
const DistributorGoodsType = require('../models/distributorGoodsType');
const AuditGoods = require('../models/audit_goods');

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

/**
 * 获取所有商品类型
 */
router.get('/types', isAuthenticated(), async(req, res, next) => {
    let types = await DistributorGoodsType.findAll();
    res.json(types);
});

/**
 * 创建商品类型
 */
router.post('/createType', isAuthenticated(), async(req, res, next) => {
    let types = req.body;
    types.id = UUID.v1();
    types.createdAt = new Date();
    types.updatedAt = new Date();
    let newtypes = await DistributorGoodsType.create(types);
    res.json(newtypes);
});

/**
 * 修改商品类型
 */
router.post('/updateType', isAuthenticated(), async(req, res, next) => {
    let types = req.body;
    let newtypes = await DistributorGoodsType.update(types, {
        where: {
            id: types.id
        }
    });
    res.json(newtypes);
});

/**
 * 删除商品类型
 */
router.post('/deleteType', isAuthenticated(), async(req, res, next) => {
    let type = req.body;
    await DistributorGoodsType.destroy({
        where: {
            id: type.id
        }
    });
    res.json({});
});

/**
 * 根据goodsId查找audit_goods
 */
router.get('/auditGoodsByGoodsId', isAuthenticated(), async(req, res, next) => {
    let audit_goods = await AuditGoods.findAll({
        where: {
            distributorGoodsId: req.query.id
        }
    });
    res.json(audit_goods);
});

/**
 * 添加商品审核
 */
router.get('/createAuditGoods', isAuthenticated(), async(req, res, next) => {
    let audit_goods = {};
    audit_goods.id = UUID.v1();
    audit_goods.createdAt = new Date();
    audit_goods.updatedAt = new Date();
    audit_goods.distributorGoodsId = req.query.id;
    let new_audit_goods = await AuditGoods.create(audit_goods);
    res.json(new_audit_goods);
});



module.exports = router;