const express = require('express');
const router = express.Router();
const UUID = require('uuid');
const DistributorGoodsType = require('../models/distributorGoodsType');
const ManufacturerGoods = require('../models/manufacturerGoods');
const ManufacturerUser = require('../models/manufacturerUser');
const User = require('../models/user');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const {
    isAuthenticated
} = require('../auth/auth.service');


/**
 * 获取所有已开通的厂商
 */
router.get('/validateManufacturerUser', async (req, res, next) => {
    let page = req.query.page;
    let type = req.query.type;
    let users = await User.findAll({
        where: {
            roleId: '2191c46c-e6c4-11e7-b42e-060400ef5315',
            isValidate: true,
            label: {
                [Op.like]: '%' + type + '%'
            }
        },
        limit: 10,
        offset: 10 * (page - 1)
    });
    for (const u of users) {
        u.dataValues.manufacturer = await ManufacturerUser.findOne({
            where: {
                userId: u.dataValues.id
            }
        })
    }
    res.json(users);
});

/**
 * 获取当前厂商所有产品
 */
router.get('/', async (req, res, next) => {
    let manufacturers = await ManufacturerGoods.findAll({
        where: {
            manufacturerId: req.query.manufacturerId
        }
    });
    res.json(manufacturers);
});

/**
 * 获取商品
 */
router.get('/getGoodsById', async (req, res, next) => {
    let goods = await ManufacturerGoods.findOne({
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
 * 创建产品
 */
router.post('/create', isAuthenticated(), async (req, res, next) => {
    let goods = req.body;
    goods.id = UUID.v1();
    goods.createdAt = new Date();
    goods.updatedAt = new Date();
    let newgoods = await ManufacturerGoods.create(goods);
    let manufacturerUser = await ManufacturerUser.findOne({
        where: {
            id: goods.manufacturerId
        }
    })
    let user = await User.findOne({
        where: {
            id: manufacturerUser.dataValues.userId
        }
    })
    let allGoods = await ManufacturerGoods.findAll({
        where: {
            manufacturerId: manufacturerUser.dataValues.id
        }
    })
    const labels = []
    for (const g of allGoods) {
        let labelCount = labels.findIndex(l => l === g.dataValues.type)
        if (labelCount === -1) {
            labels.push(g.dataValues.type)
        }
    }
    user.dataValues.label = labels.join('|')
    await User.update(user.dataValues, {
        where: {
            id: user.dataValues.id
        }
    });
    res.json(newgoods);
});


/**
 * 修改产品
 */
router.post('/update', isAuthenticated(), async (req, res, next) => {
    let goods = req.body;
    let newgoods = await ManufacturerGoods.update(goods, {
        where: {
            id: goods.id
        }
    });
    let manufacturerUser = await ManufacturerUser.findOne({
        where: {
            id: goods.manufacturerId
        }
    })
    let user = await User.findOne({
        where: {
            id: manufacturerUser.dataValues.userId
        }
    })
    let allGoods = await ManufacturerGoods.findAll({
        where: {
            manufacturerId: manufacturerUser.dataValues.id
        }
    })
    const labels = []
    for (const g of allGoods) {
        let labelCount = labels.findIndex(l => l === g.dataValues.type)
        if (labelCount === -1) {
            labels.push(g.dataValues.type)
        }
    }
    user.dataValues.label = labels.join('|')
    await User.update(user.dataValues, {
        where: {
            id: user.dataValues.id
        }
    });
    res.json(newgoods);
});

/**
 * 产品放入回收站
 */
router.post('/recovery', isAuthenticated(), async (req, res, next) => {
    let goods = req.body;
    goods.isDelete = true
    let newgoods = await ManufacturerGoods.update(goods, {
        where: {
            id: goods.id
        }
    });
    let manufacturerUser = await ManufacturerUser.findOne({
        where: {
            id: goods.manufacturerId
        }
    })
    let user = await User.findOne({
        where: {
            id: manufacturerUser.dataValues.userId
        }
    })
    let allGoods = await ManufacturerGoods.findAll({
        where: {
            manufacturerId: manufacturerUser.dataValues.id
        }
    })
    const labels = []
    for (const g of allGoods) {
        let labelCount = labels.findIndex(l => l === g.dataValues.type)
        if (labelCount === -1) {
            labels.push(g.dataValues.type)
        }
    }
    user.dataValues.label = labels.join('|')
    await User.update(user.dataValues, {
        where: {
            id: user.dataValues.id
        }
    });
    res.json(newgoods);
});

/**
 * 从回收站恢复产品
 */
router.post('/reRecovery', isAuthenticated(), async (req, res, next) => {
    let goods = req.body;
    goods.isDelete = false
    let newgoods = await ManufacturerGoods.update(goods, {
        where: {
            id: goods.id
        }
    });
    let manufacturerUser = await ManufacturerUser.findOne({
        where: {
            id: goods.manufacturerId
        }
    })
    let user = await User.findOne({
        where: {
            id: manufacturerUser.dataValues.userId
        }
    })
    let allGoods = await ManufacturerGoods.findAll({
        where: {
            manufacturerId: manufacturerUser.dataValues.id
        }
    })
    const labels = []
    for (const g of allGoods) {
        let labelCount = labels.findIndex(l => l === g.dataValues.type)
        if (labelCount === -1) {
            labels.push(g.dataValues.type)
        }
    }
    user.dataValues.label = labels.join('|')
    await User.update(user.dataValues, {
        where: {
            id: user.dataValues.id
        }
    });
    res.json(newgoods);
});

/**
 * 删除产品
 */
router.get('/delete', isAuthenticated(), async (req, res, next) => {
    await ManufacturerGoods.destroy({
        where: {
            id: req.query.id
        }
    });
    res.json({});
});

/**
 * 更改产品图片字段
 */
router.post('/updateImage', isAuthenticated(), async (req, res, next) => {
    let images = req.body.images;
    let goodsId = req.body.id;
    let goods = await ManufacturerGoods.findOne({
        where: {
            id: goodsId
        }
    })
    let goods_r = goods.dataValues;
    goods_r.photos = images;
    let newgoods = await ManufacturerGoods.update(goods_r, {
        where: {
            id: goods_r.id
        }
    });
    res.json(newgoods);
});


module.exports = router;