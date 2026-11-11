const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  getRegistrationStatus,
  registerAdmin,
  loginAdmin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfile,
  updateProfile,
} = require("../controllers/adminAuthController");

router.get("/registration-status", getRegistrationStatus);
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

router.get("/profile", protect("admin"), getProfile);
router.put("/profile", protect("admin"), updateProfile);

module.exports = router;
