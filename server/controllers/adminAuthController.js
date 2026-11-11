// Handles: Admin Register (protected), Login, Forgot Password (OTP), Reset Password, Profile
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Admin = require("../models/Admin");
const Otp = require("../models/Otp");
const sendOtpEmail = require("../utils/sendEmail");
const { issueOtp, checkOtp } = require("../utils/otp");

const isStr = (v) => typeof v === "string" && v.trim() !== ""; // blocks NoSQL-injection objects
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeEqual = (a, b) => {
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

// @desc Tells the register page whether a secret code is needed (only the very first admin is free)
// @route GET /api/admins/registration-status
exports.getRegistrationStatus = async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    res.json({ requiresCode: count > 0 });
  } catch (error) {
    res.status(500).json({ message: "Failed to check registration status" });
  }
};

// @desc Register admin. First admin: open. After that: needs ADMIN_REGISTER_CODE from server .env.
//       Existing admins are NEVER deleted; duplicates are rejected.
// @route POST /api/admins/register
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, phone, password, secretCode } = req.body;
    if (![username, email, phone, password].every(isStr)) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      const expected = process.env.ADMIN_REGISTER_CODE;
      if (!expected) {
        return res.status(403).json({ message: "Admin registration is closed" });
      }
      if (!isStr(secretCode) || !safeEqual(secretCode, expected)) {
        return res.status(403).json({ message: "Invalid admin secret code" });
      }
    }

    const exists = await Admin.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(409).json({ message: "Username or email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Admin.create({ username, email, phone, password: hashedPassword });

    res.status(201).json({ message: "Registered successfully. Please login.", user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// @desc Login using username or email + password
// @route POST /api/admins/login
exports.loginAdmin = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username or email
    if (!isStr(identifier) || !isStr(password)) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }
    const user = await Admin.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, "admin");
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// @desc Send a real 6-digit OTP to the registered email (1 minute resend cooldown)
// @route POST /api/admins/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isStr(email)) return res.status(400).json({ message: "Email is required" });

    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    const result = await issueOtp(email);
    if (result.error) return res.status(result.status).json({ message: result.error });

    await sendOtpEmail(email, result.otp);

    res.json({ message: "OTP sent to your registered email" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// @desc Verify OTP (max 5 wrong attempts per OTP)
// @route POST /api/admins/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!isStr(email) || !isStr(otp)) return res.status(400).json({ message: "Email and OTP are required" });

    const result = await checkOtp(email, otp);
    if (!result.ok) return res.status(result.status).json({ message: result.message });
    res.json({ message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
};

// @desc Reset password after OTP verification
// @route POST /api/admins/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!isStr(email) || !isStr(otp) || !isStr(newPassword)) {
      return res.status(400).json({ message: "Email, OTP and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const result = await checkOtp(email, otp);
    if (!result.ok) return res.status(result.status).json({ message: result.message });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Admin.findOneAndUpdate({ email }, { password: hashedPassword });
    await Otp.deleteMany({ email });

    res.json({ message: "Password reset successful. Please login with your new password." });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed", error: error.message });
  }
};

// @desc Get logged-in profile
// @route GET /api/admins/profile
exports.getProfile = async (req, res) => {
  const user = await Admin.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "Admin not found" });
  res.json(user);
};

// @desc Update logged-in profile
// @route PUT /api/admins/profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;
    const user = await Admin.findByIdAndUpdate(
      req.user.id,
      { username, phone },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};
