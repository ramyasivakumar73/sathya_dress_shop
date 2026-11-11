// Send OTP through Resend's HTTPS API when configured; keep Gmail SMTP for local use.
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS?.replace(/\s/g, ""),
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  const html = `
      <div style="font-family: Arial, sans-serif; max-width:500px; margin:auto; border:1px solid #eee; border-radius:10px; overflow:hidden;">
        <div style="background:linear-gradient(135deg,#7a0c2e,#b8860b); padding:20px; text-align:center;">
          <h1 style="color:#fff; margin:0;">SATHYA DRESS SHOP</h1>
        </div>
        <div style="padding:25px; color:#333;">
          <p>Dear Customer,</p>
          <p>Your OTP is:</p>
          <h2 style="letter-spacing:6px; color:#7a0c2e;">${otp}</h2>
          <p>This OTP expires in <b>5 minutes</b>.</p>
          <p>Do not share this OTP with anyone.</p>
          <br/>
          <p>Regards,<br/>SATHYA DRESS SHOP</p>
        </div>
      </div>
    `;

  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "SATHYA DRESS SHOP <onboarding@resend.dev>",
        to: [toEmail],
        subject: "SATHYA DRESS SHOP Password Reset OTP",
        html,
      }),
    });

    if (!response.ok) {
      const error = new Error(`Resend rejected the email request (HTTP ${response.status})`);
      error.code = "ERESEND";
      throw error;
    }

    return;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error("Email is not configured");
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }

  await transporter.sendMail({
    from: `"SATHYA DRESS SHOP" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "SATHYA DRESS SHOP Password Reset OTP",
    html,
  });
};

module.exports = sendOtpEmail;
