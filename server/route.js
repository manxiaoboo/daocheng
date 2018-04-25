
const routerConfig = (app) => {
    app.use('/', require('./routes/index'));
    app.use('/users', require('./routes/user'));
    app.use('/devices', require('./routes/device'));
    app.use('/qiniu', require('./routes/qiniu'));
    app.use('/distributor', require('./routes/distributor'));
    app.use('/manufacturer', require('./routes/manufacturer'));
    app.use('/order', require('./routes/order'));
    app.use('/question', require('./routes/question'));
    app.use('/auth', require('./auth'));
}

module.exports = routerConfig;

