const User = require("../models/user");
module.exports = {
  async sign(ctx) {
    let result = {
      state: false,
      code: 1, // 0 注册成功  1缺少参数  2 用户名已注册
      message: "注册失败"
    };
    console.log(ctx.request.body);
    const { username, openid, gender } = ctx.request.body;
    if (!username || !openid) {
      result.message = "缺少姓名或openid";
      ctx.body = result;
    } else {
      let user = await User.findOne({ openid });
      // 检查用户名是否已存在
      if (!user) {
        const newUser = new User({
          username: username,
          openid: openid,
          gender: gender||0,
          registerdate: new Date()
        });
        const doc = await newUser.save();
        if (!doc.errors) {
          ctx.body = { state: true, code: 0, message: "注册成功" };
        } else {
          ctx.body = result;
        }
      } else {
        ctx.body = { state: true, code: 2, message: "用户名已注册" };
      }
    }
  },
};
