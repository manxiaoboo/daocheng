const express = require('express');
const router = express.Router();
const UUID = require('uuid');
const User = require('../models/user');
const DistributorUser = require('../models/distributorUser');
const DistributorGoods = require('../models/distributorGoods');
const DistributorGoodsType = require('../models/distributorGoodsType');
const AuditGoods = require('../models/audit_goods');
const Order = require('../models/order');

const {
    isAuthenticated
} = require('../auth/auth.service');


/**
 * 获取所有订单
 */
router.get('/getAllOrders', isAuthenticated(), async (req, res, next) => {
    let page = req.query.page;
    let result = {
        orders:[],
        counts:{}
    };
    let query = {};
    if (req.query.status != 'all') {
        query.status = req.query.status;
    }else{
        query.status = {
            $ne: 'deleted'
        }
    }
    if (req.query.term) {
        query.no = req.query.term;
    }
    let orders = await Order.findAll({
        where: query,
        order: [
            ['createdAt', 'DESC']
        ],
        limit: 10,
        offset: 10 * (page - 1)
    });
    for (const o of orders) {
        ao = o.dataValues
        ao.distributor = await DistributorUser.findOne({
            where: {
                id: ao.distributorId
            }
        })
        ao.farmer = await User.findOne({
            where: {
                id: ao.farmerId
            }
        })
        if (ao.data) ao.data = JSON.parse(ao.data);
    }
    result.orders = orders;
    result.counts.all = await Order.count();
    result.counts.sent = await Order.count({where:{status:'sent'}});
    result.counts.return = await Order.count({where:{status:'return'}});
    result.counts.done = await Order.count({where:{status:'done'}});
    result.counts.deleted = await Order.count({where:{status:'deleted'}});
    res.json(result);
});


/**
 * 获取当前农户所有订单
 */
router.get('/getFarmerOrders', isAuthenticated(), async (req, res, next) => {
    let page = req.query.page;
    let orders = await Order.findAll({
        where: {
            farmerId: req.query.id,
            status: req.query.status
        },
        order: [
            ['updatedAt', 'DESC']
        ],
        limit: 10,
        offset: 10 * (page - 1)
    });
    for (const o of orders) {
        ao = o.dataValues
        ao.distributor = await DistributorUser.findOne({
            where: {
                id: ao.distributorId
            }
        })
        if (ao.data) ao.data = JSON.parse(ao.data);
    }
    res.json(orders);
});

/**
 * 获取当前供应商所有订单
 */
router.get('/getDistributorOrders', isAuthenticated(), async (req, res, next) => {
    let page = req.query.page;
    let orders = await Order.findAll({
        where: {
            distributorId: req.query.id,
            status: req.query.status
        },
        order: [
            ['updatedAt', 'DESC']
        ],
        limit: 10,
        offset: 10 * (page - 1)
    });
    for (const o of orders) {
        ao = o.dataValues
        ao.distributor = await DistributorUser.findOne({
            where: {
                id: ao.distributorId
            }
        })
        ao.farmer = await User.findOne({
            where: {
                id: ao.farmerId
            }
        })
        if (ao.data) ao.data = JSON.parse(ao.data);
    }
    res.json(orders);
});

/**
 * 将订单置为sent状态
 */
router.post('/sentOrder', isAuthenticated(), async (req, res, next) => {
    let orders = await Order.findOne({
        where: {
            id: req.body.id
        }
    });
    let ao = orders.dataValues
    ao.status = 'sent';
    ao.address = req.body.address;
    let neworder = await Order.update(ao, {
        where: {
            id: ao.id
        }
    });
    res.json(neworder);
});

/**
 * 将订单置为return状态
 */
router.post('/returnOrder', isAuthenticated(), async (req, res, next) => {
    let orders = await Order.findOne({
        where: {
            id: req.body.id
        }
    });
    let ao = orders.dataValues
    ao.status = 'return';
    ao.count = req.body.count;
    ao.totalPrice = req.body.price;
    let neworder = await Order.update(ao, {
        where: {
            id: ao.id
        }
    });
    res.json(neworder);
});

/**
 * 将订单置为done状态
 */
router.post('/doneOrder', isAuthenticated(), async (req, res, next) => {
    let orders = await Order.findOne({
        where: {
            id: req.body.id
        }
    });
    let ao = orders.dataValues
    ao.status = 'done';
    let neworder = await Order.update(ao, {
        where: {
            id: ao.id
        }
    });
    res.json(neworder);
});



/**
 * 通过id获取订单
 */
router.get('/order', isAuthenticated(), async (req, res, next) => {
    let orders = await Order.findOne({
        where: {
            id: req.query.id
        }
    });
    let ao = orders.dataValues
    ao.distributor = await DistributorUser.findOne({
        where: {
            id: ao.distributorId
        }
    })
    ao.farmer = await User.findOne({
        where: {
            id: ao.farmerId
        }
    })
    if (ao.data) ao.data = JSON.parse(ao.data);
    res.json(orders);
});

/**
 * 创建订单
 */
router.post('/create', isAuthenticated(), async (req, res, next) => {
    let order = req.body;
    if (order.data) order.data = JSON.stringify(order.data);
    order.id = UUID.v1();
    order.createdAt = new Date();
    order.status = 'new';
    let no = UUID.v4();
    no = new Date().getTime().toString().slice(8) + no.replace(/-/g, '').slice(0, 4).toUpperCase();
    order.no = no;
    let neworder = await Order.create(order);
    res.json(neworder);
});

/**
 * 删除订单
 */
router.get('/deleteOrder', isAuthenticated(), async (req, res, next) => {
    let order = await Order.findOne({
        where: {
            id: req.query.id
        }
    });
    let od = order.dataValues
    if (od.status == 'new') {
        await Order.destroy({
            where: {
                id: od.id
            }
        });
        res.json();
    } else {
        od.preStatus = od.status;
        od.status = 'deleted';
        od.deletedBy = req.query.userId;
        od.deletedAt = new Date();
        let neworder = await Order.update(od, {
            where: {
                id: od.id
            }
        });
        res.json(neworder);
    }
});

module.exports = router;