const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var ExpertUser = sequelize.define('expertUser', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    }, userId: {
        type: Sequelize.UUID,
        field: 'userId'
    }, name: {
        type: Sequelize.STRING,
        field: 'name'
    },score: {
        type: Sequelize.INTEGER,
        field: 'score'
    }, level: {
        type: Sequelize.INTEGER,
        field: 'level'
    }, domain: {
        type: Sequelize.STRING,
        field: 'domain'
    }, intro: {
        type: Sequelize.STRING,
        field: 'intro'
    }, accept: {
        type: Sequelize.INTEGER,
        field: 'accept'
    }, createdAt: {
        type: Sequelize.DATE,
        field: 'createdAt'
    }, updatedAt: {
        type: Sequelize.DATE,
        field: 'updatedAt'
    },
}, {
        freezeTableName: true// Model 对应的表名将与model名相同
    });

module.exports = ExpertUser;