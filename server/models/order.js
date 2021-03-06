const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var Order = sequelize.define('order', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    }, no: {
        type: Sequelize.STRING,
        field: 'no'
    }, data: {
        type: Sequelize.STRING,
        field: 'data'
    }, distributorId: {
        type: Sequelize.STRING,
        field: 'distributorId'
    }, farmerId: {
        type: Sequelize.STRING,
        field: 'farmerId'
    }, status: {
        type: Sequelize.STRING,
        field: 'status'
    }, preStatus: {
        type: Sequelize.STRING,
        field: 'preStatus'
    }, count: {
        type: Sequelize.INTEGER,
        field: 'count'
    }, totalPrice: {
        type: Sequelize.DECIMAL,
        field: 'totalPrice'
    }, address: {
        type: Sequelize.STRING,
        field: 'address'
    }, note: {
        type: Sequelize.STRING,
        field: 'note'
    }, deletedBy: {
        type: Sequelize.UUID,
        field: 'deletedBy'
    }, createdAt: {
        type: Sequelize.DATE,
        field: 'createdAt'
    },updatedAt: {
        type: Sequelize.DATE,
        field: 'updatedAt'
    }, completedAt: {
        type: Sequelize.DATE,
        field: 'completedAt'
    },
    deletedAt: {
        type: Sequelize.DATE,
        field: 'deletedAt'
    }
},
    {
        freezeTableName: true// Model 对应的表名将与model名相同
    });

module.exports = Order;