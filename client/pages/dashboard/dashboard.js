var config = require('../../config')
var util = require('../../utils/util.js')

var sliderWidth = 96;
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
    adGoods: [],
    questions: [],
    types: [],
    manufacturers: [],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    canShow: false,
    me: '',
    tabs: ["热门商品", "最新问答"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    inputShowed: false,
    inputVal: ""
  },
  onLoad: function () {
    console.info("首页 => load");
    var that = this;

  },
  onShow: function () {
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
            that.loadData(res.data)
          },
          fail: function (err) {
            let me = { role: 'visitor' }
            that.setData({
              me: me,
              canShow: true
            })
            that.loadData(me)
          }
        })
      },
      fail: function (err) {
        let me = { role: 'visitor' }
        that.setData({
          me: me,
          canShow: true
        })
        that.loadData(me)
      }
    })
  },
  loadData: function (me) {
    let that = this;
    let token = wx.getStorageSync('authToken');
    if (me.userName == 'nonghu1') {
      that.setData({
        tabs: ["热门商品"]
      })
    } else {
      that.setData({
        tabs: ["热门商品", '最新问答']
      })
    }

    if (me.roleId == '304414ba-e6c4-11e7-b42e-060400ef5315') {
      that.setData({
        tabs: ["热门商品", '最新问答', '厂商']
      })
    }
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });

    wx.request({
      url: config.service.host + '/distributor/goodsSortByHot?page=1',
      header: {
        'content-type': 'application/json'
      },
      success: function (res_goods) {
        let goods = res_goods.data;
        goods.forEach(g => {
          if (g.photos) {
            g.photos_arr = g.photos.split(',')
          }
          if (g.photos_arr.length > 2) {
            g.photos_arr.pop();
            g.photos_arr.pop();
          }
          g.updatedDate = util.formatTime2(new Date(g.updatedAt));
        })
        that.setData({
          goods: goods
        })
      }
    })

    // wx.request({
    //   url: config.service.host + '/distributor/goodsSortByAD?page=1',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   success: function (res_adgoods) {
    //     let goods = res_adgoods.data;
    //     goods.forEach(g => {
    //       if (g.photos) {
    //         g.photos_arr = g.photos.split(',')
    //       }
    //       g.photos_arr.pop();
    //       g.photos_arr.pop();
    //       g.updatedDate = util.formatTime2(new Date(g.updatedAt));
    //     })
    //     that.setData({
    //       adGoods: goods
    //     })
    //   }
    // })

    wx.request({
      url: config.service.host + '/question/allQuestions?page=1',
      header: {
      },
      success: (res_questions) => {
        console.info(res_questions.data)
        let questions = res_questions.data;
        questions.forEach(o => {
          o.createdDate = util.formatTime2(new Date(o.createdAt));
          if (o.completedAt) o.completedDate = util.formatTime2(new Date(o.completedAt));
        })
        that.setData({
          questions: questions
        })
      },
      fail: function (err) {

      }
    })

    wx.request({
      url: config.service.host + '/distributor/types',
      header: {
        'content-type': 'application/json'
      },
      success: function (res_types) {
        let types = res_types.data;
        that.setData({
          types: types
        })
      }
    })

    wx.request({
      url: config.service.host + '/users/roles',
      header: {
        'content-type': 'application/json'
      },
      success: function (res_roles) {
        let roles = res_roles.data;
        roles.forEach(r => {
          if (r.id == me.roleId) {
            me.roleName = r.cName;
          }
        });
        that.setData({
          me: me
        })
        wx.request({
          url: config.service.host + '/qiniu',
          header: {
            'content-type': 'application/json'
          },
          success: function (res_qiniu) {
            let qiniu = res_qiniu.data;
            wx.setStorageSync('uploadToken', qiniu.uploadToken)
            if (me.roleName == '专家') {
              wx.request({
                url: config.service.host + '/users/expertByUserId?userId=' + me.id,
                header: {
                  'content-type': 'application/json'
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
                      wx.navigateTo({
                        url: '../login/login'
                      })
                    }
                  })
                },
                fail: function (err) {
                  wx.navigateTo({
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
                  wx.request({
                    url: config.service.host + '/manufacturer/validateManufacturerUser?page=1',
                    header: {
                      'Authorization': 'Bearer ' + token
                    },
                    success: (res_manufacturer) => {
                      console.info(res_manufacturer.data)
                      that.setData({
                        canShow: true,
                        manufacturers: res_manufacturer.data
                      })
                      wx.setStorage({
                        key: "user",
                        data: me
                      })
                      wx.setStorage({
                        key: "roles",
                        data: roles
                      })
                    },
                    fail: function (err) {
                    }
                  })
                },
                fail: function (err) {
                  wx.navigateTo({
                    url: '../login/login'
                  })
                }
              })
            } else if (me.roleName == '厂商') {
              wx.request({
                url: config.service.host + '/users/manufacturerByUserId?userId=' + me.id,
                header: {
                  'content-type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                success: function (res_manufacturer) {
                  let manufacturer = res_manufacturer.data;
                  me.manufacturer = manufacturer;
                  console.info(me.manufacturer)
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
                  wx.navigateTo({
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
        wx.navigateTo({
          url: '../login/login'
        })
      }
    })
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  goQuestion: function () {
    wx.navigateTo({
      url: '../question-more-list/question-more-list'
    })
  },
  goManufacturers: function () {
    wx.switchTab({
      url: '../manufacturer-list/manufacturer-list'
    })
  },
  call: function (e) {
    if (this.data.me.role == 'visitor') {
      wx.showModal({
        title: '游客提示',
        content: '您尚未登录，是否立即登录？',
        confirmText: "登录",
        cancelText: "取消",
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../login/login'
            })
          }
        }
      });
      return;
    }
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
})