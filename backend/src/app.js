const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes"); // <-- Import admin routes
const errorHandler = require("./middleware/errorHandler");
const AppError=require('./utils/appError')
const donationRoutes=require('./routes/donationRoutes')
dotenv.config();

const app = express();
// Connect to Database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/donation',donationRoutes)
app.use("/api/admin", adminRoutes);
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

//Global error Handler Middleware
app.use(errorHandler);

module.exports = app;
