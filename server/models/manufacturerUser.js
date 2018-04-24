const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var ManufacturerUser = sequelize.define('manufacturerUser', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    },
    userId: {
        type: Sequelize.UUID,
        field: 'userId'
    },
    name: {
        type: Sequelize.STRING,
        field: 'name'
    },
    head: {
        type: Sequelize.STRING,
        field: 'head'
    },
    address: {
        type: Sequelize.STRING,
        field: 'address'
    },
    intro: {
        type: Sequelize.STRING,
        field: 'intro'
    },
    contact: {
        type: Sequelize.INTEGER,
        field: 'contact'
    },
    contactPhone: {
        type: Sequelize.STRING,
        field: 'contactPhone'
    },
    createdAt: {
        type: Sequelize.DATE,
        field: 'createdAt'
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: 'updatedAt'
    },
}, {
    freezeTableName: true // Model 对应的表名将与model名相同
});

module.exports = ManufacturerUser;