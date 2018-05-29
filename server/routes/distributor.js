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
router.get('/', async(req, res, next) => {
    let goods = await DistributorGoods.findAll({
        where: {
            distributorId: req.query.distributorId
        }
    });
    res.json(goods);
});

/**
 * 获取所有上架商品 按热度排序
 */
router.get('/goodsSortByHot', async(req, res, next) => {
    let page = req.query.page;
    let goods;
    goods = await DistributorGoods.findAll({
        where: {
            isAudit: 1,
            isRunning: 1
        },
        order: [
            ['hot', 'DESC']
        ],
        limit:10,
        offset: 10 * (page -1)
    });
    for (const g of goods) {
        ag = g.dataValues
        ag.distributor = await DistributorUser.findOne({
            where: {
                id: ag.distributorId
            }
        })
        ag.type_ele = await DistributorGoodsType.findOne({
            where: {
                id: ag.type
            }
        })
    }
    res.json(goods);
});

/**
 * 获取所有广告商品 按热度排序
 */
router.get('/goodsSortByAd', async(req, res, next) => {
    let page = req.query.page;
    let goods;
    goods = await DistributorGoods.findAll({
        where: {
            isAudit: 1,
            isRunning: 1,
            isAd: 1
        },
        order: [
            ['hot', 'DESC']
        ],
        limit:10,
        offset: 10 * (page -1)
    });
    for (const g of goods) {
        ag = g.dataValues
        ag.distributor = await DistributorUser.findOne({
            where: {
                id: ag.distributorId
            }
        })
        ag.type_ele = await DistributorGoodsType.findOne({
            where: {
                id: ag.type
            }
        })
    }
    res.json(goods);
});

/**
 * 获取所有类型商品 按热度排序
 */
router.get('/goodsSortByType', async(req, res, next) => {
    let page = req.query.page;
    let goods;
    goods = await DistributorGoods.findAll({
        where: {
            isAudit: 1,
            isRunning: 1,
            type:req.query.type
        },
        order: [
            ['hot', 'DESC']
        ],
        limit:10,
        offset: 10 * (page -1)
    });
    for (const g of goods) {
        ag = g.dataValues
        ag.distributor = await DistributorUser.findOne({
            where: {
                id: ag.distributorId
            }
        })
        ag.type_ele = await DistributorGoodsType.findOne({
            where: {
                id: ag.type
            }
        })
    }
    res.json(goods);
});

/**
 * 获取所有通过审核并且上架的商品
 */
router.get('/allAuditedGoods', async(req, res, next) => {
    let goods = await DistributorGoods.findAll({
        where: {
            isAudit: 1,
            isRunning: 1
        }
    });
    for (const g of goods) {
        ag = g.dataValues
        ag.distributor = await DistributorUser.findOne({
            where: {
                id: ag.distributorId
            }
        })
        ag.type_ele = await DistributorGoodsType.findOne({
            where: {
                id: ag.type
            }
        })
    }
    res.json(goods);
});

/**
 * 获取所有通过审核并且上架并且是广告的商品
 */
router.get('/allAdGoods', async(req, res, next) => {
    let goods = await DistributorGoods.findAll({
        where: {
            isAudit: 1,
            isRunning: 1,
            isAd: 1
        }
    });
    for (const g of goods) {
        ag = g.dataValues
        ag.distributor = await DistributorUser.findOne({
            where: {
                id: ag.distributorId
            }
        })
        ag.type_ele = await DistributorGoodsType.findOne({
            where: {
                id: ag.type
            }
        })
    }
    res.json(goods);
});


/**
 * 获取商品
 */
router.get('/getGoodsById', async(req, res, next) => {
    let goods = await DistributorGoods.findOne({
        where: {
            id: req.query.id
        }
    });
    goods.dataValues.type_ele = await DistributorGoodsType.findOne({
        where: {
            id: goods.dataValues.type
        }
    })
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
 * 更改商品图片字段
 */
router.post('/updateImage', isAuthenticated(), async(req, res, next) => {
    let images = req.body.images;
    let goodsId = req.body.id;
    let goods = await DistributorGoods.findOne({
        where:{
            id: goodsId
        }
    })
    let goods_r = goods.dataValues;
    goods_r.photos = images;
    let newgoods = await DistributorGoods.update(goods_r, {
        where: {
            id: goods_r.id
        }
    });
    res.json(newgoods);
});

/**
 * 商品下架
 */
router.get('/close', isAuthenticated(), async(req, res, next) => {
    let goodsId = req.query.id;
    let goods = await DistributorGoods.findOne({
        where:{
            id: goodsId
        }
    })
    let goods_r = goods.dataValues;
    goods_r.isRunning = false;
    let newgoods = await DistributorGoods.update(goods_r, {
        where: {
            id: goods_r.id
        }
    });
    res.json(newgoods);
});

/**
 * 商品上架
 */
router.get('/open', isAuthenticated(), async(req, res, next) => {
    let goodsId = req.query.id;
    let goods = await DistributorGoods.findOne({
        where:{
            id: goodsId
        }
    })
    let goods_r = goods.dataValues;
    goods_r.isRunning = true;
    let newgoods = await DistributorGoods.update(goods_r, {
        where: {
            id: goods_r.id
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
router.get('/types', async(req, res, next) => {
    let types = await DistributorGoodsType.findAll({
        order: [
            ['position', 'ASC']
        ],
    });
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
router.get('/auditGoodsByGoodsId', async(req, res, next) => {
    let audit_goods = await AuditGoods.findAll({
        where: {
            distributorGoodsId: req.query.id
        }
    });
    res.json(audit_goods);
});

/**
 * 查找所有audit_goods
 */
router.get('/auditGoods', async(req, res, next) => {
    let audit_goods = await AuditGoods.findAll();
    for (const ag of audit_goods) {
        agd = ag.dataValues
        agd.goods = await DistributorGoods.findOne({
            where: {
                id: agd.distributorGoodsId
            }
        })
        agd.goods.dataValues.distributor = await DistributorUser.findOne({
            where: {
                id: agd.goods.dataValues.distributorId
            }
        })
        agd.goods.dataValues.type_ele = await DistributorGoodsType.findOne({
            where: {
                id: agd.goods.dataValues.type
            }
        })
    }
    res.json(audit_goods);
});

/**
 * 检查商品是否在审核状态
 */
router.get('/checkAuditGoods', isAuthenticated(), async(req, res, next) => {
    let audit_goods = await AuditGoods.findAll({
        where:{
            distributorGoodsId: req.query.id
        }
    });
    res.json(audit_goods);
});

/**
 * 通过商品审核
 */
router.get('/auditGoodsPass', isAuthenticated(), async(req, res, next) => {
    await AuditGoods.destroy({where:{id:req.query.auditId}})
    let goods = await DistributorGoods.findOne({where:{id: req.query.goodsId}})
    let goods_r = goods.dataValues;
    goods_r.isAudit = true;
    goods_r.rejectReason = null;
    let newGoods = await DistributorGoods.update(goods_r,{
        where: {
            id: goods_r.id
        }
    })
    res.json(newGoods);
});

/**
 * 通过商品修改审核
 */
router.post('/auditGoodsEditPass', isAuthenticated(), async(req, res, next) => {
    await AuditGoods.destroy({where:{id:req.body.auditId}})
    let goods = req.body.goods;
    goods.isAudit = true;
    goods.rejectReason = null;
    let newGoods = await DistributorGoods.update(goods,{
        where: {
            id: goods.id
        }
    })
    res.json(newGoods);
});



/**
 * 拒绝商品审核
 */
router.post('/auditGoodsReject', isAuthenticated(), async(req, res, next) => {
    await AuditGoods.destroy({where:{id:req.body.auditId}})
    let goods = await DistributorGoods.findOne({where:{id: req.body.goodsId}})
    let goods_r = goods.dataValues;
    goods_r.rejectReason = req.body.reason;
    let newGoods = await DistributorGoods.update(goods_r,{
        where: {
            id: goods_r.id
        }
    })
    res.json(newGoods);
});

/**
 * 添加商品审核
 */
router.post('/createAuditGoods', isAuthenticated(), async(req, res, next) => {
    let audit_goods = req.body;
    if(audit_goods.data)audit_goods.data = JSON.stringify(audit_goods.data);
    audit_goods.id = UUID.v1();
    audit_goods.createdAt = new Date();
    audit_goods.updatedAt = new Date();
    let new_audit_goods = await AuditGoods.create(audit_goods);
    res.json(new_audit_goods);
});

/**
 * 增加商品浏览量
 */
router.get('/farmerlook', isAuthenticated(), async(req, res, next) => {
    let goods = await DistributorGoods.findOne({
        where:{
            id: req.query.id
        }
    })
    let goods_r = goods.dataValues;
    goods_r.totalView = goods_r.totalView + 1;
    goods_r.hot = goods_r.totalView + (goods_r.totalDeal * 200);
    let newgoods = await DistributorGoods.update(goods_r, {
        where: {
            id: goods_r.id
        }
    });
    res.json(newgoods);
});

/**
 * 增加商品成交量
 */
router.get('/farmerDeal', isAuthenticated(), async(req, res, next) => {
    let goods = await DistributorGoods.findOne({
        where:{
            id: req.query.id
        }
    })
    let goods_r = goods.dataValues;
    goods_r.totalDeal = goods_r.totalDeal + 1;
    goods_r.hot = goods_r.totalView + (goods_r.totalDeal * 200);
    let newgoods = await DistributorGoods.update(goods_r, {
        where: {
            id: goods_r.id
        }
    });
    res.json(newgoods);
});

module.exports = router;