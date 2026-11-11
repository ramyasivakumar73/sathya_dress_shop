// OTP model used for Forgot Password flow
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0 }, // wrong-guess counter (brute-force protection)
  createdAt: { type: Date, default: Date.now, expires: 300 }, // auto-delete after 5 minutes
});

module.exports = mongoose.model("Otp", otpSchema);
