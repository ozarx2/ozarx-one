require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const applicationsRoutes = require("./routes/applications");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

// Validate required environment variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:", missingEnvVars.join(", "));
  process.exit(1);
}

const app = express();

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    exposedHeaders: ["x-auth-token"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Body parser middleware
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Server error",
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/job-portal")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Function to kill process using a port
async function killProcessOnPort(port) {
  try {
    if (process.platform === "win32") {
      const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
      const lines = stdout.split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[parts.length - 1];
          await execPromise(`taskkill /F /PID ${pid}`);
        }
      }
    } else {
      await execPromise(`lsof -ti:${port} | xargs kill -9`);
    }
  } catch (err) {
    console.log(`No process found on port ${port}`);
  }
}

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Try to kill any existing process on the port
    await killProcessOnPort(PORT);

    // Wait a moment for the port to be freed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

startServer();

// Export app for use in routes
module.exports = app;
