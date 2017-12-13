const users = require('./routes/user');

const routerConfig = (app) => {
    app.use('/users', users);
}

module.exports = routerConfig;

