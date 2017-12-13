const User = require('../models/user');

async function get(ctx, next) {
  ctx.response.body = await User.findOne({
    where: { id: '97DAA625-8DCC-68A0-6AB2-F0EC367D7740' }
  })
}



module.exports = {
  get
}