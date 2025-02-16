const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
