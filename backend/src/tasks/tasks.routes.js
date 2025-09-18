const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { createTask, listTasks, updateTask, deleteTask } = require("./task.controller");

const router = express.Router();

router.use(authenticate); 

router.post("/", createTask);
router.get("/", listTasks);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

module.exports = router;
