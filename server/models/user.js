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
    }, loginName: {
        type: Sequelize.STRING,
        field: 'loginName'
    }, roleId: {
        type: Sequelize.UUID,
        field: 'roleId'
    }, phone: {
        type: Sequelize.STRING,
        field: 'phone'
    }, isValidate: {
        type: Sequelize.BOOLEAN,
        field: 'isValidate'
    }, validateCode: {
        type: Sequelize.STRING,
        field: 'validateCode'
    }, openId: {
        type: Sequelize.STRING,
        field: 'openId'
    }, openId: {
        type: Sequelize.STRING,
        field: 'openId'
    }, createdAt: {
        type: Sequelize.DATE,
        field: 'createdAt'
    }, updatedAt: {
        type: Sequelize.DATE,
        field: 'updatedAt'
    },
}, {
        freezeTableName: true // Model 对应的表名将与model名相同
    });

module.exports = User;