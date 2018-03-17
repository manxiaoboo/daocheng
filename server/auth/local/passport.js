var passport = require('passport');
var LocalStrategy = require('passport-local');
var {
  encryptPassword
} = require('../auth.service');


function localAuthenticate(User, userName, password, done) {
  let query = {
    userName: userName.toLowerCase()
  }
  User.findOne({
      where: query
    })
    .then(user => {
      if (!user) {
        return done(null, false, {
          message: 'This userName is not registered.'
        });
      }
      let user_t = user.dataValues;
      encryptPassword(password, user_t.salt, (err, pwd) => {
        if (user_t.password != pwd) {
          return done(null, false, {
            message: 'This password is not correct.'
          });
        } else {
          return done(null, user_t);
        }
      });
    })
    .catch(err => done(err));
}

exports.setup =
  (User) => {
    console.log(User);
    passport.use(new LocalStrategy({
      usernameField: 'userName',
      passwordField: 'password',
    }, (loginName, password, done) => {
      return localAuthenticate(User, loginName, password, done);
    }));
  }