var passport = require('passport');
var LocalStrategy = require('passport-local');
var { encryptPassword } = require('../auth.service');


function localAuthenticate(User, userName, password, done) {
  User.findOne({
    where: { userName: userName.toLowerCase() }
  })
    .then(user => {
      if (!user) {
        return done(null, false, {
          message: 'This userName is not registered.'
        });
      }
      let user_t = user.dataValues;
      encryptPassword(password,user_t.salt,(err, pwd)=>{
        if(user_t == pwd){
          return done(null, false, { message: 'This password is not correct.' });
        }else{
          return done(null, user_t);
        }
      });
    })
    .catch(err => done(err));
}

exports.setup =
  (User) => {
    passport.use(new LocalStrategy({
      usernameField: 'userName',
      passwordField: 'password' // this is the virtual field on the model
    }, (loginName, password, done) => {
      return localAuthenticate(User, loginName, password, done);
    }));
  }