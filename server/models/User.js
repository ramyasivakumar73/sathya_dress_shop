// User model (customers browsing the shop)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // hashed with bcrypt
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
