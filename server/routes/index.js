var express = require('express');
var router = express.Router();
const { auth: { authorization, validation,authorizationMiddleware } } = require("../qcloud");


/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/login', async function (req, res, next) {
    let auth = await authorization(req);
    if (auth.loginState) {
        auth.time =  Math.floor(Date.now() / 1000);
        auth.skey = auth.userinfo.skey;
        let result = {
            code:0,
            data:auth
        }
        res.json(result);
    }
});



module.exports = router;
