
const routerConfig = (app) => {
    app.use('/', require('./routes/index'));
    app.use('/users', require('./routes/user'));
    app.use('/auth', require('./auth'));
}

module.exports = routerConfig;

