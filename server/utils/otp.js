// OTP helpers: secure generation, resend cooldown, and attempt limiting
const crypto = require("crypto");
const Otp = require("../models/Otp");

const MAX_ATTEMPTS = 5; // wrong guesses allowed per OTP
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between OTP requests

const safeEqual = (a, b) => {
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

// Creates a new OTP for the email (or returns an error if requested too soon)
exports.issueOtp = async (email) => {
  const existing = await Otp.findOne({ email });
  if (existing) {
    const age = Date.now() - existing.createdAt.getTime();
    if (age < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - age) / 1000);
      return { error: `Please wait ${wait} seconds before requesting a new OTP`, status: 429 };
    }
  }
  const otp = crypto.randomInt(100000, 1000000).toString();
  await Otp.deleteMany({ email });
  await Otp.create({ email, otp });
  return { otp };
};

// Checks an OTP. Every check counts as an attempt; after MAX_ATTEMPTS the OTP is destroyed.
exports.checkOtp = async (email, otp) => {
  // Atomic increment first, so parallel guesses can't bypass the limit
  const record = await Otp.findOneAndUpdate({ email }, { $inc: { attempts: 1 } }, { new: true });
  if (!record) return { ok: false, status: 400, message: "Invalid or expired OTP" };

  const tooMany = { ok: false, status: 429, message: "Too many wrong attempts. Please request a new OTP." };
  if (record.attempts > MAX_ATTEMPTS) {
    await Otp.deleteMany({ email });
    return tooMany;
  }
  if (!safeEqual(record.otp, otp)) {
    if (record.attempts >= MAX_ATTEMPTS) {
      await Otp.deleteMany({ email });
      return tooMany;
    }
    return { ok: false, status: 400, message: `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempt(s) left` };
  }
  return { ok: true };
};
