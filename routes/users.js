const router = require("koa-router")();
const homeController = require("../controller/homeController");

router.prefix("/users");

router.post("/sign", homeController.sign);

router.get("/bar", function(ctx, next) {
  ctx.body = "this is a users/bar response";
});

module.exports = router;
