const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var Domain = sequelize.define('domain', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        field: 'name'
    },
    createdAt: {
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

module.exports = Domain;