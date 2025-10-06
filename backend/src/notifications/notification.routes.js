const express = require("express");
const controller = require("./notification.controller");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.use(authenticate);

router.post("/", controller.create);
router.get("/", controller.list);
router.patch("/:id/read", controller.markRead);

module.exports = router;
