var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const config = require('./config');
const routerConfig = require('./route');
const { passport, passport_config } = require('./passport');


var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
    res.send('Hello World!');
});

passport_config(passport);
routerConfig(app);

// 启动程序，监听端口
app.listen(config.port, () => console.log(`listening on port ${config.port}`))

module.exports = app;
