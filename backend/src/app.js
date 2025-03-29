const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes"); // <-- Import admin routes
const donation = require("./routes/donation");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/appError");
const donationRoutes = require("./routes/donationRoutes");
dotenv.config();

const app = express();
// app.use(cors());

// ❌ Remove this duplicate line
// app.use(cors());

// ✅ Keep only this one with proper configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Must match your frontend URL exactly
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to Database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/donation", donationRoutes);

app.use("/api/organization", donation);
app.use("/api/admin", adminRoutes);
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use("/uploads", express.static("uploads"));
//Global error Handler Middleware
app.use(errorHandler);

module.exports = app;
