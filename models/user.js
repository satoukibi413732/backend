/** * 用户信息 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: { type: String, unique: true, require: true }, //用户账号
  openid: { type: String }, //微信openid
  gender: { type: Number }, //性别
  magazine: { type: Array }, //已购杂志
  registerdate: { type: Date }
});
module.exports = mongoose.model("User", UserSchema);
