const Sequelize = require('sequelize');
const dbconfig = require('../config');

var sequelize = new Sequelize(dbconfig.mysql.db,dbconfig.mysql.user,dbconfig.mysql.pass,{
    host:dbconfig.mysql.host,
    port:dbconfig.mysql.port,
    dialect:'mysql',
    pool:{
        max:200,
        min:0,
        idle:10000
    }
});

module.exports = sequelize;