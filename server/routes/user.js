const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { passport } = require('../passport');

/* GET users listing. */
router.get('/', async (req, res, next) => {
    let user = await User.findAll();
    res.send(user);
});

router.post('/login', (req, res, next)=>{
   res.send("haha");
});

module.exports = router;
