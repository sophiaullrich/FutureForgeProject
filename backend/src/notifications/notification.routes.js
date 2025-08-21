const express = require("express");
const controller = require("./notification.controller");

const router = express.Router();

router.post("/", controller.create);       
router.get("/", controller.list);          
router.patch("/:id/read", controller.markRead);

module.exports = router;
