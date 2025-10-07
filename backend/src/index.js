const express = require('express');
const cors = require('cors');
const taskRoutes = require("./tasks/tasks.routes");
const notificationRoutes = require('./notifications/notification.routes');
const profileRoutes = require('./profile-page/profile.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');
const rewardsRoutes = require('./rewards/rewardsRoutes');
const chatRoutes = require('./chat/chatServer'); 

const app = express();
const PORT = process.env.PORT || 5001;

// middleware first
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json());

// routes
app.use('/tasks', taskRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('Backend server is running on port 3000.');
});

// error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.use('/dashboard', dashboardRoutes);
app.use('/api/rewards', rewardsRoutes);

// start ONCE
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy`);
  } else {
    console.error('Server error:', error);
  }
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});