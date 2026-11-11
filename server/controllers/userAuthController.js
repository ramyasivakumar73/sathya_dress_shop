// Handles: User Register, Login, Forgot Password (OTP), Reset Password, Profile
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const sendOtpEmail = require("../utils/sendEmail");
const { issueOtp, checkOtp } = require("../utils/otp");

const isStr = (v) => typeof v === "string" && v.trim() !== ""; // blocks NoSQL-injection objects
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @desc Register user. Duplicate username/email is rejected (old accounts are never deleted).
// @route POST /api/users/register
exports.registerUser = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    if (![username, email, phone, password].every(isStr)) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(409).json({ message: "Username or email already registered. Please login or use Forgot Password." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, phone, password: hashedPassword });

    res.status(201).json({ message: "Registered successfully. Please login.", user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// @desc Login using username or email + password
// @route POST /api/users/login
exports.loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username or email
    if (!isStr(identifier) || !isStr(password)) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, "user");
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// @desc Send a real 6-digit OTP to the registered email (1 minute resend cooldown)
// @route POST /api/users/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!isStr(email)) return res.status(400).json({ message: "Email is required" });
    const hasResendConfig = Boolean(process.env.RESEND_API_KEY);
    const hasGmailConfig = Boolean(
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_USER !== "youremail@gmail.com" &&
      process.env.EMAIL_PASS !== "your_gmail_app_password"
    );
    if (!hasResendConfig && !hasGmailConfig) {
      return res.status(503).json({ message: "OTP email is not configured. Set RESEND_API_KEY and EMAIL_FROM, or configure Gmail SMTP." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    const result = await issueOtp(email);
    if (result.error) return res.status(result.status).json({ message: result.error });

    try {
      await sendOtpEmail(email, result.otp);
    } catch (error) {
      await Otp.deleteMany({ email });
      const authenticationFailed = error.code === "EAUTH";
      const connectionFailed = ["ECONNECTION", "ETIMEDOUT", "ESOCKET"].includes(error.code);
      const message = authenticationFailed
        ? "Gmail rejected the credentials. Check EMAIL_USER and use a current Google App Password."
        : connectionFailed
          ? "Could not connect to Gmail SMTP. Configure RESEND_API_KEY on Render to send OTP over HTTPS."
          : error.code === "ERESEND"
            ? "Email provider rejected the request. Check RESEND_API_KEY and verify the sender in Resend."
          : "OTP email delivery failed. Check the server email settings and try again.";
      console.error("OTP email delivery failed:", error.code || "unknown");
      return res.status(502).json({ message });
    }

    res.json({ message: "OTP sent to your registered email" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
};

// @desc Verify OTP (max 5 wrong attempts per OTP)
// @route POST /api/users/verify-otp
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
// @route POST /api/users/reset-password
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
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await Otp.deleteMany({ email });

    res.json({ message: "Password reset successful. Please login with your new password." });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed", error: error.message });
  }
};

// @desc Get logged-in profile
// @route GET /api/users/profile
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// @desc Update logged-in profile
// @route PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, phone },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};
