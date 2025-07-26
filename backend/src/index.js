const express = require('express');
const cors = require('cors');
const taskRoutes = require('./tasks/task.controller');
const teamRoutes = require('./teams/teams.routes'); 

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/tasks', taskRoutes);
app.use('/teams', teamRoutes); 

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
