const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var AuditGoods = sequelize.define('audit_goods', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    },
    distributorGoodsId: {
        type: Sequelize.UUID,
        field: 'distributorGoodsId'
    },
    type: {
        type: Sequelize.STRING,
        field: 'type'
    },
    data: {
        type: Sequelize.STRING,
        field: 'data'
    },
    createdAt: {
        type: Sequelize.DATE,
        field: 'createdAt'
    }, updatedAt: {
        type: Sequelize.DATE,
        field: 'updatedAt'
    },
}, {
        freezeTableName: true// Model 对应的表名将与model名相同
    });

module.exports = AuditGoods;