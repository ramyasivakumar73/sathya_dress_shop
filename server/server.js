// Entry point for Sathya Dress Shop backend server
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");

const isProd = process.env.NODE_ENV === "production";

// Refuse to start without a proper JWT secret
if (!process.env.JWT_SECRET || (isProd && process.env.JWT_SECRET.includes("change_me"))) {
  console.error("FATAL: set a strong JWT_SECRET in server/.env");
  process.exit(1);
}

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Allowed website origins come from .env (localhost is added automatically only in development)
const allowedOrigins = [process.env.USER_CLIENT_URL, process.env.ADMIN_CLIENT_URL].filter(Boolean);
if (!isProd) allowedOrigins.push("http://localhost:3000", "http://localhost:3001");
if (isProd && allowedOrigins.length === 0) {
  console.warn("WARNING: USER_CLIENT_URL / ADMIN_CLIENT_URL are not set - browsers will be blocked by CORS");
}
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/products", productRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("SATHYA DRESS SHOP API is running...");
});

// Global error handler
app.use((err, req, res, next) => {
  // Image upload problems -> clear 400 messages instead of a generic 500
  if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "Each image must be 5MB or smaller",
      LIMIT_FILE_COUNT: "You can upload up to 6 images",
      LIMIT_UNEXPECTED_FILE: "You can upload up to 6 images",
    };
    return res.status(400).json({ message: messages[err.code] || `Upload error: ${err.message}` });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid request data" });
  }
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
