var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const config = require('./config');
const routerConfig = require('./route');
require('./qcloud');


var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
    });


app.get('/', function (req, res) {
    res.send('Hello World!');
});
routerConfig(app);

// 启动程序，监听端口
app.listen(config.port, () => console.log(`listening on port ${config.port}`))

module.exports = app;
