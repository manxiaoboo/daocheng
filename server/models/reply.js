const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var Reply = sequelize.define('reply', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    }, content: {
        type: Sequelize.STRING,
        field: 'content'
    }, parentId: {
        type: Sequelize.UUID,
        field: 'parentId'
    }, rootId: {
        type: Sequelize.UUID,
        field: 'rootId'
    }, replyUser: {
        type: Sequelize.UUID,
        field: 'replyUser'
    }, replyRole: {
        type: Sequelize.STRING,
        field: 'replyRole'
    }, createdAt: {
        type: Sequelize.DATE,
        field: 'createdAt'
    }, updatedAt: {
        type: Sequelize.DATE,
        field: 'updatedAt'
    }
},
    {
        freezeTableName: true// Model 对应的表名将与model名相同
    });

module.exports = Reply;