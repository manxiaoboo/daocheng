const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var Device = sequelize.define('device', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    },
    appid: {
        type: Sequelize.STRING,
        field: 'appid'
    }, username: {
        type: Sequelize.STRING,
        field: 'username'
    }, password: {
        type: Sequelize.STRING,
        field: 'password'
    }, did: {
        type: Sequelize.STRING,
        field: 'did'
    }, passcode: {
        type: Sequelize.STRING,
        field: 'passcode'
    },mac: {
        type: Sequelize.STRING,
        field: 'mac'
    },productKey: {
        type: Sequelize.STRING,
        field: 'productKey'
    },productSecret: {
        type: Sequelize.STRING,
        field: 'productSecret'
    }, productName: {
        type: Sequelize.STRING,
        field: 'productName'
    }, productType: {
        type: Sequelize.STRING,
        field: 'productType'
    }, note: {
        type: Sequelize.STRING,
        field: 'note'
    }, isUse: {
        type: Sequelize.STRING,
        field: 'isUse'
    }, createdAt: {
        type: Sequelize.DATE,
        field: 'createdAt'
    }, updatedAt: {
        type: Sequelize.DATE,
        field: 'updatedAt'
    },
},
    {
        freezeTableName: true// Model 对应的表名将与model名相同
    });

module.exports = Device;