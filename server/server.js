
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

// Check JWT Secret
if (
  !process.env.JWT_SECRET ||
  (isProd && process.env.JWT_SECRET.includes("change_me"))
) {
  console.error("FATAL: Please set a strong JWT_SECRET");
  process.exit(1);
}

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.USER_CLIENT_URL,
  process.env.ADMIN_CLIENT_URL,
  "https://sathya-dress-shop.netlify.app",
  "https://sathya-dress-shop-admin.netlify.app",
].filter(Boolean);

if (!isProd) {
  allowedOrigins.push(
    "http://localhost:3000",
    "http://localhost:3001"
  );
}

app.use(cors({
  origin: allowedOrigins.map((origin) => origin.replace(/\/+$/, "")),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/products", productRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("SATHYA DRESS SHOP API is running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "Each image must be 5MB or smaller",
      LIMIT_FILE_COUNT: "You can upload up to 6 images",
      LIMIT_UNEXPECTED_FILE: "You can upload up to 6 images",
    };

    return res.status(400).json({
      message: messages[err.code] || `Upload error: ${err.message}`,
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid request data",
    });
  }

  console.error(err.stack);

  res.status(500).json({
    message: "Something went wrong on the server",
  });
});

// Start Server After MongoDB Connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
