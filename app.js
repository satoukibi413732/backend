const Koa = require("koa");
const app = new Koa();
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const cors = require("koa2-cors");
const mongoose = require("mongoose");
const KoaBodyParser = require('koa-bodyparser');
const KoaXmlBody = require('koa-xml-body');
const config = require("./config");

const index = require("./routes/resource");
const users = require("./routes/users");

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"]
  })
);
app.use(json());
app.use(logger());
app.use(KoaXmlBody());
app.use(KoaBodyParser());
app.use(require("koa-static")(__dirname + "/public"));
// 跨域解决
app.use(
  cors({
    origin: function (ctx) {
      // if (ctx.url === "/test") {
      //   return "*"; // 允许来自所有域名请求
      // }
      // return "http://localhost:8080";
      return "*";
    },
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"],
    maxAge: 5,
    credentials: true,
    allowMethods: ["GET", "POST", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"]
  })
);
// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});
// 连接数据库;
mongoose.Promise = global.Promise;
mongoose.connect(config.database, config.DB_OPTION);
// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

/** * 插入 */

module.exports = app;
