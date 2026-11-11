const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfile,
  updateProfile,
} = require("../controllers/userAuthController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

router.get("/profile", protect("user"), getProfile);
router.put("/profile", protect("user"), updateProfile);

module.exports = router;
