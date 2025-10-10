// backend/src/index.js
const express = require("express");
const cors = require("cors");
const taskRoutes = require("./tasks/tasks.routes");
const notificationRoutes = require("./notifications/notification.routes");
const profileRoutes = require("./profile-page/profile.routes");
const dashboardRoutes = require("./dashboard/dashboard.routes");
const rewardsRoutes = require("./rewards/rewardsRoutes");
const chatRoutes = require("./chat/chatServer");

const app = express();
const PORT = process.env.PORT || 5001;

// middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const allowedOrigins = [
  "http://localhost:3000",
  "https://future-forge-project.vercel.app",
  "https://future-forge-project-ezra8fqzo-sophias-projects-55766626.vercel.app",
  "https://future-forge-project-c65y9o56t-sophias-projects-55766626.vercel.app",
  "https://australia-southeast1-gobear-c15ba.cloudfunctions.net", 
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// routes
app.use("/tasks", taskRoutes);
app.use("/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/rewards", rewardsRoutes);

app.get("/", (req, res) => {
  res.send("Backend server is running successfully.");
});

// error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

if (process.env.NODE_ENV !== "production") {
  const server = app.listen(PORT, () => {
    console.log(`Server running locally on http://localhost:${PORT}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${PORT} is busy`);
    } else {
      console.error("Server error:", error);
    }
  });

  process.on("SIGINT", () => {
    console.log("Shutting down server...");
    server.close(() => {
      console.log("Server stopped");
      process.exit(0);
    });
  });
}

module.exports = app;
