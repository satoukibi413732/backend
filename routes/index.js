const router = require("koa-router")();
const path = require("path");
const send = require("koa-send");

router.get("/download/:name", async (ctx, next) => {
  const name = ctx.params.name;
  const path = `public/${name}`;
  ctx.attachment(path);
  await send(ctx, path);
});

router.get("/json", async (ctx, next) => {
  ctx.body = {
    title: "koa2 json"
  };
});

module.exports = router;
