Page({
    data: {
        motto: '稻成一体化平台'
    },
    onLoad: function () {
        console.info("haha");
    },
    goRegister: function () {
        wx.redirectTo({
            url: '../register/register'
        })
    }
})