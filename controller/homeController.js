const User = require("../models/user");
const axios = require("axios");
const config = require("../config");
function getWxApi(jsCode) { }
module.exports = {
    async sign(ctx) {
        let result = {
            state: false,
            code: 1, // 0 注册成功  1缺少参数  2 用户名已注册 3 数据库异常 4 微信接口异常
            message: "注册失败"
        };
        const { username, jsCode, gender } = ctx.request.body;
        if (!username || !jsCode) {
            result.message = "缺少必要参数";
            ctx.body = result;
        } else {
            await axios
                .get(
                    `https://api.weixin.qq.com/sns/jscode2session?appid=${config.appid}&secret=${config.secret}&js_code=${jsCode}&grant_type=authorization_code`
                )
                .then(async res => {
                    const { openid, errcode, errmsg, session_key } = res.data;
                    await User.findOne({ openid: openid }, (err, resp) => {
                        if (err) {
                            console.log("error:" + err);
                            return;
                        }
                        // 检查用户名是否已存在
                        if (!resp) {
                            if (openid) {
                                const newUser = new User({
                                    username: username,
                                    openid: openid,
                                    gender: gender || 0,
                                    magazine: [],
                                    registerdate: new Date()
                                });
                                const doc = newUser.save();
                                if (!doc.errors) {
                                    result.state = true;
                                    result.code = 0;
                                    result.message = "注册成功";
                                    result.openid = openid;
                                    result.session_key = session_key;
                                    ctx.body = result;
                                } else {
                                    result.state = false;
                                    result.code = 3;
                                    result.message = "数据库异常";
                                    ctx.body = result;
                                }
                            } else {
                                result.state = false;
                                result.code = 4;
                                result.message = "微信接口异常";
                                result.errmsg = errmsg;
                                ctx.body = result;
                            }
                        } else {
                            result.state = true;
                            result.code = 2;
                            result.message = "用户名已注册";
                            result.openid = openid;
                            result.session_key = session_key;
                            ctx.body = result;
                        }
                    });
                });
        }
    }
};
