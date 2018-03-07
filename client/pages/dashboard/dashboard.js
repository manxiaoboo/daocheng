var config = require('../../config')
var util = require('../../utils/util.js')
Page({
  data: {
    imgUrls: [
      'http://p0oy6nmva.bkt.clouddn.com/1.jpg',
      'http://p0oy6nmva.bkt.clouddn.com/2.jpg',
      'http://p0oy6nmva.bkt.clouddn.com/3.jpg',
      'http://p0oy6nmva.bkt.clouddn.com/4.jpg',
      'http://p0oy6nmva.bkt.clouddn.com/5.jpg',
      'http://p0oy6nmva.bkt.clouddn.com/6.jpg'
    ],
    goods: [],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    canShow: false
  },
  onLoad: function () {
    console.info("首页 => load");
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
              let me = res.data;

              
              wx.request({
                url: config.service.host + '/distributor/goodsSortByHot?page=1',
                header: {
                  'content-type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                success: function (res_goods) {
                  let goods = res_goods.data;
                  goods.forEach(g => {
                    if(g.photos){
                      g.photos_arr = g.photos.split(',')
                    }
                  })
                  that.setData({
                    goods:goods
                  })
                  console.info(goods)
                }
              })

              wx.request({
                url: config.service.host + '/users/roles',
                header: {
                  'content-type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                success: function (res_roles) {
                  let roles = res_roles.data;
                  roles.forEach(r => {
                    if (r.id == me.roleId) {
                      me.roleName = r.cName;
                    }
                  });
                  console.info(me)
                  wx.request({
                    url: config.service.host + '/qiniu',
                    header: {
                      'content-type': 'application/json',
                      'Authorization': 'Bearer ' + token
                    },
                    success: function (res_qiniu) {
                      let qiniu = res_qiniu.data;
                      wx.setStorageSync('uploadToken', qiniu.uploadToken)
                      if (me.roleName == '专家') {
                        wx.request({
                          url: config.service.host + '/users/expertByUserId?userId=' + me.id,
                          header: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                          },
                          success: function (res_expert) {
                            let expert = res_expert.data;
                            wx.request({
                              url: config.service.host + '/users/all-domain',
                              header: {
                                'content-type': 'application/json',
                                'Authorization': 'Bearer ' + token
                              },
                              success: function (res_domains) {
                                let domains = res_domains.data;
                                me.expert = expert;
                                wx.setStorage({
                                  key: "user",
                                  data: me
                                })
                                wx.setStorage({
                                  key: "roles",
                                  data: roles
                                })
                                wx.setStorage({
                                  key: "domains",
                                  data: domains
                                })
                                that.setData({
                                  canShow: true
                                });
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
                      } else if (me.roleName == '农户') {
                        if (me.deviceId && me.isValidate) {
                          wx.request({
                            url: config.service.host + '/devices/getDeviceById?deviceId=' + me.deviceId,
                            header: {
                              'Authorization': 'Bearer ' + token
                            },
                            success: function (res_device) {
                              let device = res_device.data;
                              me.device = device;
                              console.info(me)
                              wx.request({
                                url: config.service.host + '/devices/jzy-login',
                                method: 'POST',
                                header: {
                                  'Authorization': 'Bearer ' + token
                                },
                                data: {
                                  appid: device.appid,
                                  username: me.id,
                                  password: me.id
                                },
                                success: function (res_login) {
                                  wx.setStorageSync('jzyUserToken', res_login.data);
                                  wx.setStorageSync('user', me);
                                  wx.setStorageSync('roles', roles);
                                  that.setData({
                                    canShow: true
                                  });
                                },
                                fail: function (err) {

                                }
                              })
                            },
                            fail: function (err) {

                            }
                          })
                        } else {
                          wx.setStorageSync('user', me);
                          wx.setStorageSync('roles', roles);
                          that.setData({
                            canShow: true
                          });
                        }
                      } else if (me.roleName == '经销商') {
                        wx.request({
                          url: config.service.host + '/users/distributorByUserId?userId=' + me.id,
                          header: {
                            'content-type': 'application/json',
                            'Authorization': 'Bearer ' + token
                          },
                          success: function (res_distributor) {
                            let distributor = res_distributor.data;
                            me.distributor = distributor;
                            wx.setStorage({
                              key: "user",
                              data: me
                            })
                            wx.setStorage({
                              key: "roles",
                              data: roles
                            })
                            that.setData({
                              canShow: true
                            });
                          },
                          fail: function (err) {
                            wx.redirectTo({
                              url: '../login/login'
                            })
                          }
                        })
                      } else {
                        wx.setStorageSync('user', me);
                        wx.setStorageSync('roles', roles);
                        that.setData({
                          canShow: true
                        });
                      }
                    }
                  });
                },
                fail: function (err) {
                  wx.redirectTo({
                    url: '../login/login'
                  })
                }
              })
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