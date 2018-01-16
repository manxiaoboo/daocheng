const express = require('express');
const router = express.Router();
const qiniu = require('qiniu');
const UUID = require('uuid');

const {
    isAuthenticated
} = require('../auth/auth.service');

/**
 * 获取七牛token
 */
router.get('/', isAuthenticated(), async(req, res, next) => {
    let accessKey = '8vfLR9ldMXbIUUlDm39FjKuAtCrbeLjl9GZeBufQ';
    let secretKey = '42beooQFa_D9yjZPNr3YYJMzLXHQOqzJYJQnryk5';
    let bucket = 'daocheng-images'
    let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    let options = {
        scope: bucket,
    };
    let putPolicy = new qiniu.rs.PutPolicy(options);
    putPolicy.saveKey = UUID.v1();
    let uploadToken = putPolicy.uploadToken(mac);
    res.json({uploadToken:uploadToken});
});

/**
 * 删除七牛文件
 */
router.get('/delete', isAuthenticated(), async(req, res, next) => {
    let bucket = 'daocheng-images'
    let accessKey = '8vfLR9ldMXbIUUlDm39FjKuAtCrbeLjl9GZeBufQ';
    let secretKey = '42beooQFa_D9yjZPNr3YYJMzLXHQOqzJYJQnryk5';
    let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    let config = new qiniu.conf.Config();
    let bucketManager = new qiniu.rs.BucketManager(mac, config);
    bucketManager.delete(bucket, req.query.entry, function(err, respBody, respInfo) {
        if (err) {
          console.log(err);
          res.status(500).send("error");
        } else {
         res.json("ok");
        }
      });
});


module.exports = router;