const router = require("koa-router")();
const resourceController = require("../controller/resourceController");
router.get("/", async (ctx, next) => {
  await ctx.render("index");
});
router.post("/resourceAll", resourceController.getAll);
router.post("/setMagazine", resourceController.setMagazine);
router.post("/getPayment", resourceController.getPayment);
router.post("/pay/result", resourceController.payResult);

module.exports = router;
