const router = require("koa-router")();
const resourceController = require("../controller/resourceController");

router.post("/resourceAll", resourceController.getAll);
router.post("/setMagazine", resourceController.setMagazine);
router.post("/getPayment", resourceController.getPayment)

module.exports = router;
