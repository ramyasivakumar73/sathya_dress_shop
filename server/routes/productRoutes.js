const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getDashboardStats,
} = require("../controllers/productController");

// Public routes (User Product Page)
router.get("/", getProducts);
router.get("/stats/dashboard", protect("admin"), getDashboardStats);
router.get("/:id", getProductById);

// Admin-only protected routes
router.post("/", protect("admin"), upload.array("images", 6), createProduct);
router.put("/:id", protect("admin"), upload.array("images", 6), updateProduct);
router.delete("/:id", protect("admin"), deleteProduct);

module.exports = router;
