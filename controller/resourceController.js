const User = require("../models/user");
module.exports = {
  getAll(ctx) {
    var files = require("./flies.js");
    let result = {
      state: false,
      data: null,
      filesLength: 0,
      message: "获取失败"
    };
    let imageList = files.getImageFiles(__dirname + "/../public/images/");
    var iamgeFmt = [];
    imageList.forEach(item => {
      iamgeFmt.push({
        name: item.split(".")[0],
        enable: false,
        filePath: ctx.request.origin + "/h5/" + item.split(".")[0] + ".html",
        imagePath: ctx.request.origin + "/images/" + item
      });
    });
    const testDb = ["杂志测试1"]; //测试用
    iamgeFmt.forEach((item, i) => {
      testDb.forEach((db, j) => {
        if (item.name === db) {
          console.log(item.name);
          item.enable = true;
        }
      });
    });
    result = {
      state: true,
      data: iamgeFmt,
      filesLength: iamgeFmt.length,
      message: "获取成功"
    };
    ctx.body = result;
  },

  async setMagazine(ctx) {
    let result = {
      state: false,
      message: "服务器错误,请联系客服"
    };
    const { openid, filename } = ctx.request.body;
    await User.update(
      { openid: openid },
      { $addToSet: { magazine: filename } },
      (err, resp) => {
        if (err) {
          ctx.body = result;
        } else {
          result.message = "购买成功";
          result.state = true;
          result.openid = openid;
          result.filename = filename;
          ctx.body = result;
        }
      }
    );
  }
};
