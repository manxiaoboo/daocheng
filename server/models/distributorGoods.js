const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize-service');

var DistributorGoods = sequelize.define('distributorGoods', {
    id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true
    },
    distributorId: {
        type: Sequelize.UUID,
        field: 'distributorId'
    },
    name: {
        type: Sequelize.STRING,
        field: 'name'
    },
    unit: {
        type: Sequelize.STRING,
        field: 'unit'
    },
    priceStart: {
        type: Sequelize.DOUBLE,
        field: 'priceStart'
    },
    priceEnd: {
        type: Sequelize.DOUBLE,
        field: 'priceEnd'
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
    totalDeal: {
        type: Sequelize.INTEGER,
        field: 'totalDeal'
    },
    totalView: {
        type: Sequelize.INTEGER,
        field: 'totalView'
    },
    hot: {
        type: Sequelize.INTEGER,
        field: 'hot'
    },
    isAd: {
        type: Sequelize.BOOLEAN,
        field: 'isAd'
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

module.exports = DistributorGoods;