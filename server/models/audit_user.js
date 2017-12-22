const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var AuditUser = sequelize.define('audit_user', {
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
    }, role: {
        type: Sequelize.UUID,
        field: 'role'
    }, phone: {
        type: Sequelize.STRING,
        field: 'phone'
    }, openId: {
        type: Sequelize.STRING,
        field: 'openId'
    }, province: {
        type: Sequelize.STRING,
        field: 'province'
    }, city: {
        type: Sequelize.STRING,
        field: 'city'
    }, area: {
        type: Sequelize.STRING,
        field: 'area'
    }, salt: {
        type: Sequelize.STRING,
        field: 'salt'
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

module.exports = AuditUser;