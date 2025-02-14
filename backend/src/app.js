// backend/src/app.js
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Import database connection
const userRoutes = require("./routes/userRoutes"); // Example route (replace with your own)
// const donationRoutes = require("./routes/donationRoutes"); // Example route

const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.use("/api/users", userRoutes);
// app.use("/api/donations", donationRoutes);

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
