const taskService = require("./task.service");
const notificationService = require("../notifications/notification.service");

const getTasks = async (req, res) => {
    try {
        const tasks = await taskService.getAllTasksForUser(req.user.uid);
        res.status(200).json(tasks);
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({ error: err.message });
    }
};

const getTask = async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.id, req.user.uid);
        res.status(200).json(task);
    } catch (err) {
        console.error("Error fetching task:", err);
        res.status(404).json({ error: err.message });
    }
};

const createTask = async (req, res) => {
    try {
        const { name, due, team } = req.body;
        if (!name || !due || !team) return res.status(400).json({ error: "Missing required fields" });

        const taskData = {
            name,
            due,
            team,
            done: false,
            userId: req.user.uid,        // tie task to current user
            assigned: req.user.uid       // optional: automatically assigned to self
        };

        const newTask = await taskService.createTask(taskData);

        try {
            await notificationService.createNotification(
                req.user.uid,
                "New Task Assigned",
                `"${newTask.name}" due ${new Date(newTask.due).toLocaleDateString()}`
            );
        } catch (notifErr) {
            console.error("Failed to create notification:", notifErr);
        }

        res.status(201).json(newTask);
    } catch (err) {
        console.error("Task creation error:", err);
        res.status(500).json({ error: err.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const updatedTask = await taskService.updateTask(req.params.id, req.body, req.user.uid);
        res.status(200).json(updatedTask);
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ error: err.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const result = await taskService.deleteTask(req.params.id, req.user.uid);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
