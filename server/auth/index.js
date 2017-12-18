'use strict';

var express = require('express');
var passport = require('passport');

// Passport Configuration
require('./local/passport').setup(require('../models/user'));

var router = express.Router();

router.use('/local', require('./local'));

module.exports = router;
