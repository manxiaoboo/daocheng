const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var User = sequelize.define('user', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    },
    nickName: {
        type: Sequelize.STRING,
        field: 'nickName'
    }, picture: {
        type: Sequelize.STRING,
        field: 'picture'
    }, password: {
        type: Sequelize.STRING,
        field: 'password'
    }, userName: {
        type: Sequelize.STRING,
        field: 'userName'
    }, roleId: {
        type: Sequelize.UUID,
        field: 'roleId'
    },role: {
        type: Sequelize.UUID,
        field: 'role'
    }, phone: {
        type: Sequelize.STRING,
        field: 'phone'
    }, isValidate: {
        type: Sequelize.BOOLEAN,
        field: 'isValidate'
    }, openId: {
        type: Sequelize.STRING,
        field: 'openId'
    },province: {
        type: Sequelize.STRING,
        field: 'province'
    },city: {
        type: Sequelize.STRING,
        field: 'city'
    },area: {
        type: Sequelize.STRING,
        field: 'area'
    },
    deviceId:{
        type: Sequelize.STRING,
        field: 'deviceId'
    },
    salt: {
        type: Sequelize.STRING,
        field: 'salt'
    },
    label: {
        type: Sequelize.STRING,
        field: 'label'
    },
    canShare: {
        type: Sequelize.BOOLEAN,
        field: 'canShare'
    },
    shareDate: {
        type: Sequelize.DATE,
        field: 'shareDate'
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

module.exports = User;