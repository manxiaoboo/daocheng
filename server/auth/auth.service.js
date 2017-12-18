'use strict';

var passport = require('passport');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../models/user');
var config = require('../config');
const crypto = require('crypto');


var validateJwt = expressJwt({
    secret: config.secrets.session
});

// exports.authenticate = (password, callback) => {
//     if (!callback) {
//         return this.password === this.encryptPassword(password);
//     }

//     this.encryptPassword(password, (err, pwdGen) => {
//         if (err) {
//             return callback(err);
//         }

//         if (this.password === pwdGen) {
//             callback(null, true);
//         } else {
//             callback(null, false);
//         }
//     });
// }

exports.encryptPassword = (password, salt_t, callback) => {
    if (!password || !salt_t) {
        return null;
    }
    let defaultIterations = 10000;
    let defaultKeyLength = 64;
    let salt = new Buffer(salt_t, 'base64');
    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength,"sha512", (err, key) => {
        if (err) {
            callback(err);
        } else {
            callback(null, key.toString('base64'));
        }
    });
}

exports.makeSalt = (callback) => {
    let byteSize = 16;
    return crypto.randomBytes(byteSize).toString('base64');
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
exports.isAuthenticated = () => {
    return compose()
        // Validate jwt
        .use(function (req, res, next) {
            // allow access_token to be passed through query parameter as well
            if (req.query && req.query.hasOwnProperty('access_token')) {
                req.headers.authorization = 'Bearer ' + req.query.access_token;
            }
            validateJwt(req, res, next);
        })
        // Attach user to request
        .use(function (req, res, next) {
            User.findById(req.user.id)
                .then(user => {
                    if (!user) {
                        return res.status(401).end();
                    }
                    req.user = user.dataValues;
                    next();
                    return null;
                })
                .catch(err => next(err));
        });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
exports.hasRole = (roleRequired) => {
    if (!roleRequired) {
        throw new Error('Required role needs to be set');
    }

    return compose()
        .use(isAuthenticated())
        .use(function meetsRequirements(req, res, next) {
            if (config.userRoles.indexOf(req.user.role) >=
                config.userRoles.indexOf(roleRequired)) {
                next();
            } else {
                res.status(403).send('Forbidden');
            }
        });
}

/**
 * Returns a jwt token signed by the app secret
 */
exports.signToken = (id, role) => {
    return jwt.sign({ id: id, role: role }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
    });
}

/**
 * Set token cookie directly for oAuth strategies
 */
exports.setTokenCookie = (req, res) => {
    if (!req.user) {
        return res.status(404).send('It looks like you aren\'t logged in, please try again.');
    }
    var token = signToken(req.user._id, req.user.role);
    res.cookie('token', token);
    res.redirect('/');
}
