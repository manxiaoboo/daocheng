const express = require('express');
const router = express.Router();
const User = require('../models/user');

/* GET users listing. */
router.get('/', async (req, res, next) => {
    let user = await User.findAll();
    res.send(user);
});



module.exports = router;
