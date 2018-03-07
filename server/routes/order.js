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
 * 获取当前农户所有订单
 */
router.get('/getFarmerOrders', isAuthenticated(), async(req, res, next) => {
    let orders = await Order.findAll({
        where: {
            farmerId: req.query.id
        }
    });
    for (const o of orders) {
        ao = o.dataValues
        ao.distributor = await DistributorUser.findOne({
            where: {
                id: ao.distributorId
            }
        })
    }
    res.json(orders);
});

/**
 * 创建订单
 */
router.post('/create', isAuthenticated(), async(req, res, next) => {
    let order = req.body;
    if(order.data)order.data = JSON.stringify(order.data);
    order.id = UUID.v1();
    order.createdAt = new Date();
    order.status = 'new';
    let neworder = await Order.create(order);
    res.json(neworder);
});

module.exports = router;