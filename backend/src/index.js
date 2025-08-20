const express = require('express');
const cors = require('cors');
const taskRoutes = require("./tasks/tasks.routes");
const teamRoutes = require('./teams/teams.routes'); 
const notificationRoutes = require('./notifications/notification.routes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/tasks', taskRoutes);
app.use('/teams', teamRoutes); 
app.use('/notifications', notificationRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
