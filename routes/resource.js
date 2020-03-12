const router = require("koa-router")();
const resourceController = require("../controller/resourceController");

router.get("/resourceAll", resourceController.getAll);
router.post("/setMagazine", resourceController.setMagazine);

module.exports = router;
