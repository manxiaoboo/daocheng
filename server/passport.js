var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');


const passport_config = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'loginName',
        passwordField: 'password'
    },
        function (username, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: '用户名不存在.' });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: '密码不匹配.' });
                }
                return done(null, user);
            });
        }
    ));
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}

module.exports = {
    passport,
    passport_config
};
