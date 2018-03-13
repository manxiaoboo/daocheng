const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var Question = sequelize.define('question', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    }, createdBy: {
        type: Sequelize.STRING,
        field: 'createdBy'
    }, status: {
        type: Sequelize.STRING,
        field: 'status'
    }, title: {
        type: Sequelize.STRING,
        field: 'title'
    }, content: {
        type: Sequelize.STRING,
        field: 'content'
    }, acceptId: {
        type: Sequelize.UUID,
        field: 'acceptId'
    }, acceptUser: {
        type: Sequelize.UUID,
        field: 'acceptUser'
    }, totalView: {
        type: Sequelize.INTEGER,
        field: 'totalView'
    }, createdAt: {
        type: Sequelize.DATE,
        field: 'createdAt'
    }, updatedAt: {
        type: Sequelize.DATE,
        field: 'updatedAt'
    }, completedAt: {
        type: Sequelize.DATE,
        field: 'completedAt'
    }
},
    {
        freezeTableName: true// Model 对应的表名将与model名相同
    });

module.exports = Question;