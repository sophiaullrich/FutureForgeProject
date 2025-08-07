const express = require('express');
const router = express.Router();
const teamService = require('./teams.service');

router.post('/', (req, res) => {
  try {
    const team = teamService.create(req.body);
    res.status(201).json(team);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  res.json(teamService.findAll());
});

router.get('/:id', (req, res) => {
  try {
    const team = teamService.findById(req.params.id);
    res.json(team);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    teamService.delete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
