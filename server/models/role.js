const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var Role = sequelize.define('role', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        field: 'name'
    }, cName: {
        type: Sequelize.STRING,
        field: 'cName'
    },position: {
        type: Sequelize.INTEGER,
        field: 'position'
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

module.exports = Role;