const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var ManufacturerGoods = sequelize.define('manufacturerGoods', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    },
    manufacturerId: {
        type: Sequelize.UUID,
        field: 'manufacturerId'
    },
    name: {
        type: Sequelize.STRING,
        field: 'name'
    },
    photos: {
        type: Sequelize.STRING,
        field: 'photos'
    },
    intro: {
        type: Sequelize.STRING,
        field: 'intro'
    },
    type: {
        type: Sequelize.UUID,
        field: 'type'
    },
    isAd: {
        type: Sequelize.BOOLEAN,
        field: 'isAd'
    },
    isDelete: {
        type: Sequelize.BOOLEAN,
        field: 'isDelete'
    },
    deleteReason: {
        type: Sequelize.STRING,
        field: 'deleteReason'
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

module.exports = ManufacturerGoods;