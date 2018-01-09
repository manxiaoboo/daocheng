var config = require('../../config')
var util = require('../../utils/util.js')
Page({
    data: {
        me: '',
        grids: [0, 1, 2, 3, 4, 5, 6, 7, 8]
    },
    onLoad: function () {
        console.info("工作台 => load");
        var that = this;
        wx.getStorage({
            key: 'user',
            success: function (res) {
                let me = res.data;
                wx.getStorage({
                    key: 'roles',
                    success: function (res_roles) {
                        let roles = res_roles.data;
                        roles.forEach(r => {
                            if (r.id == me.roleId) {
                                me.roleName = r.cName;
                            }
                        });
                        that.setData({
                            me: me
                        });
                        console.info(that.data.me);
                    }
                })
            }
        })
    }
})