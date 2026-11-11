# SATHYA DRESS SHOP — Full Stack Project

A premium, view-only women's fashion boutique website (no cart/payment/delivery — those are "Coming Soon" features).

## Tech Stack
- **Frontend (User):** React.js, React Router DOM, Axios, Bootstrap 5, Bootstrap Icons
- **Frontend (Admin):** React.js, React Router DOM, Axios, Bootstrap 5, Bootstrap Icons
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Multer, Nodemailer
- **Voice Search:** Browser Web Speech Recognition API (built into the Products page)

## Folder Structure
```
sathya-dress-shop/
├── server/           -> Express + MongoDB API        (http://localhost:5000)
├── client-user/       -> React user-facing shop site  (http://localhost:3000)
└── client-admin/      -> React admin panel            (http://localhost:3001)
```

## Prerequisites
- Node.js 20.19+ (required by the frontend build toolchain)
- MongoDB running locally (or a MongoDB Atlas connection string)
- A Gmail account with an **App Password** (for sending real OTP emails via Nodemailer)

## 1. Backend Setup (server)
```bash
cd server
npm install
cp .env.example .env
```
Edit `.env` and fill in:
```
MONGO_URI=mongodb://127.0.0.1:27017/sathya_dress_shop
PORT=5000
JWT_SECRET=your_own_secret_key
# Render OTP delivery (HTTPS API; verify a sender/domain with Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM="SATHYA DRESS SHOP <onboarding@resend.dev>"
# Local-only Gmail SMTP fallback
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password
USER_CLIENT_URL=http://localhost:3000
ADMIN_CLIENT_URL=http://localhost:3001
ADMIN_REGISTER_CODE=choose_a_private_code
NODE_ENV=development
```
(`JWT_SECRET` is required - the server will not start without it. See `.env.example` for how to generate one.)

Start the server:
```bash
npm run dev
```
Server runs at **http://localhost:5000**

## 2. User Website Setup (client-user)
```bash
cd client-user
npm install
cp .env.example .env     # set VITE_API_URL and VITE_WHATSAPP_NUMBER
npm start
```
Runs at **http://localhost:3000**

## 3. Admin Panel Setup (client-admin)
```bash
cd client-admin
npm install
cp .env.example .env     # set VITE_API_URL
npm start
```
Runs at **http://localhost:3001** (port is pre-configured via `cross-env` in package.json)

## How to Use
1. Start MongoDB, then start the `server`.
2. Start `client-admin` → Register an admin → Login → Add Products (choose category, price, images, colors, sizes, etc.)
3. Start `client-user` → Register a user → Login → Browse/search/voice-search products added by the admin. Any change the admin makes reflects immediately on refresh of the User page.
4. Forgot Password sends a **real 6-digit OTP email**. On Render, configure `RESEND_API_KEY` and a sender verified with Resend; local development can use Gmail SMTP with an App Password.

## Important Behaviors
- **Duplicate registration:** If a username or email already exists (User or Admin), registration is rejected (409). Old accounts are never deleted. Forgotten passwords are recovered via Forgot Password (OTP).
- **Admin registration is protected:** the very first admin registers freely; every later admin must enter `ADMIN_REGISTER_CODE` (from `server/.env`) on the Register page. Leave it unset to close admin registration completely.
- **OTP safety:** each OTP allows 5 wrong attempts, then it is destroyed; a new OTP can be requested once per minute.
- **No cart, no payment, no delivery, no checkout** — this is a catalog/viewing site only. Those features are shown as "Coming Soon" cards on the Home page.
- **WhatsApp button** on Product Details opens a pre-filled chat with `VITE_WHATSAPP_NUMBER` (country code + number, digits only). The button is hidden if the number is not set.
- **Voice Search** uses the built-in browser SpeechRecognition API (Chrome recommended) — no external API key needed.

## Deploying (going live)
1. Deploy `server` to a Node.js host such as Render and use MongoDB Atlas. Set `NODE_ENV=production`, a strong `JWT_SECRET`, `ADMIN_REGISTER_CODE`, `MONGO_URI`, `RESEND_API_KEY`, `EMAIL_FROM`, Cloudinary `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`, and `USER_CLIENT_URL` / `ADMIN_CLIENT_URL` in the server host's environment settings. Verify the sender/domain with Resend; its onboarding sender can only deliver to your own Resend account email. Set `USER_CLIENT_URL` to exactly `https://sathya-dress-shop.netlify.app` and `ADMIN_CLIENT_URL` to exactly `https://sathya-dress-shop-admin.netlify.app` (no trailing slashes).
2. Create two Netlify sites from this repository. For the user site, set base directory `client-user`; for the admin site, set base directory `client-admin`. Both use build command `npm run build` and publish directory `dist`.
3. Set `VITE_API_URL` to the deployed API URL in both Netlify sites. Set `VITE_WHATSAPP_NUMBER` in the user site. Trigger a new deploy after setting the variables.
4. The `public/_redirects` file in each client enables React Router routes to work on refresh.
5. New product images upload to Cloudinary and their secure URLs are stored in MongoDB. Local development uses `server/uploads` when Cloudinary is not configured; production uploads return an error until Cloudinary is configured.

## Database Collections
- `users` — registered customers
- `admins` — registered shop admins
- `products` — all dress products
- `otps` — temporary OTP records (auto-expire after 5 minutes)

## Security
- Passwords hashed with bcrypt
- JWT-based authentication with role checks (`user` / `admin`)
- Protected routes on both frontend (PrivateRoute) and backend (middleware)
