const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { createTask, listTasks } = require("./task.controller");

const router = express.Router();

router.use(authenticate); 

router.post("/", createTask);
router.get("/", listTasks);

module.exports = router;
