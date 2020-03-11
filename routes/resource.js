const router = require("koa-router")();
const resourceController = require("../controller/resourceController");

router.get("/resourceAll", resourceController.getAll);

module.exports = router;
