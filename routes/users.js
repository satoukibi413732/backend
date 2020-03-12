const router = require("koa-router")();
const homeController = require("../controller/homeController");

router.prefix("/users");

router.post("/sign", homeController.sign);



module.exports = router;
