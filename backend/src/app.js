const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());

// Import Routes (Make sure they are correctly imported)
const userRoutes = require("./routes/userRoutes");
const donationRoutes = require("./routes/donationRoutes");

// Use Routes (Make sure you're passing a function)
app.use("/api/users", userRoutes);
app.use("/api/donations", donationRoutes);

module.exports = app;
