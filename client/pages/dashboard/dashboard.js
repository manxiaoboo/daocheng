var config = require('../../config')
var util = require('../../utils/util.js')
Page({
  data: {
    imgUrls: [
      'http://p0oy6nmva.bkt.clouddn.com/banner1.jpg',
      'http://p0oy6nmva.bkt.clouddn.com/banner2.jpg',
      'http://p0oy6nmva.bkt.clouddn.com/banner3.jpg'
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    canShow: false
  },
  onLoad: function () {
    console.info("我load了");
    var that = this;
    wx.getStorage({
      key: 'authToken',
      success: function (res) {
        let token = res.data;
        wx.request({
          url: config.service.host + '/users/me?roleId=other',
          header: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          success: function (res) {
            if (res.statusCode == 401) {
              wx.redirectTo({
                url: '../login/login'
              })
            } else {
              that.setData({
                canShow: true
              });
              var me = res.data;
              wx.setStorage({
                key: "user",
                data: me
              })
              console.info(me);
            }
          },
          fail: function (err) {
            wx.redirectTo({
              url: '../login/login'
            })
          }
        })
      },
      fail: function (err) {
        wx.redirectTo({
          url: '../login/login'
        })
      }
    })
  }
})