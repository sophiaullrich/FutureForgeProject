const express = require('express');
const cors = require('cors');
const taskRoutes = require("./tasks/tasks.routes");
const notificationRoutes = require('./notifications/notification.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');
const chatRoutes = require('./chat/chatServer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/tasks', taskRoutes);
app.use('/notifications', notificationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
