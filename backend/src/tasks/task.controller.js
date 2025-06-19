const express = require('express');
const router = express.Router();
const taskService = require('./task.service');

router.post('/', (req, res) => {
  try {
    const task = taskService.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  res.json(taskService.findAll());
});

router.get('/:id', (req, res) => {
  try {
    const task = taskService.findById(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const task = taskService.update(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    taskService.delete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/assign', (req, res) => {
  try {
    const task = taskService.assign(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
