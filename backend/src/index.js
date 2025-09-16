const express = require('express');
const cors = require('cors');
const taskRoutes = require("./tasks/tasks.routes");
//const teamRoutes = require('./teams/teams.routes'); 
const notificationRoutes = require('./notifications/notification.routes');
const profileRoutes = require('./profile-page/profile.routes');

const app = express();

const PORT = process.env.PORT || 5001;
const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
        console.log('Press Ctrl+C to stop');
    }).on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', error);
        }
    });
};

startServer(PORT);

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Keep the process running despite the error
});

// Middleware with error logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/tasks', taskRoutes);
//app.use('/teams', teamRoutes); 
app.use('/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server with error handling
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop');
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

// close server
process.on('SIGINT', () => {
    console.log('\Shutting down server...');
    server.close(() => {
        console.log('Server stopped');
        process.exit(0);
    });
});
