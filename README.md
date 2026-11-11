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
4. Forgot Password sends a **real 6-digit OTP email** via Nodemailer — make sure your Gmail App Password is correctly configured in `.env`.

## Important Behaviors
- **Duplicate registration:** If a username or email already exists (User or Admin), registration is rejected (409). Old accounts are never deleted. Forgotten passwords are recovered via Forgot Password (OTP).
- **Admin registration is protected:** the very first admin registers freely; every later admin must enter `ADMIN_REGISTER_CODE` (from `server/.env`) on the Register page. Leave it unset to close admin registration completely.
- **OTP safety:** each OTP allows 5 wrong attempts, then it is destroyed; a new OTP can be requested once per minute.
- **No cart, no payment, no delivery, no checkout** — this is a catalog/viewing site only. Those features are shown as "Coming Soon" cards on the Home page.
- **WhatsApp button** on Product Details opens a pre-filled chat with `REACT_APP_WHATSAPP_NUMBER` (country code + number, digits only). The button is hidden if the number is not set.
- **Voice Search** uses the built-in browser SpeechRecognition API (Chrome recommended) — no external API key needed.

## Deploying (going live)
1. **Server** `.env`: set `NODE_ENV=production`, a strong `JWT_SECRET`, `ADMIN_REGISTER_CODE`, your MongoDB Atlas `MONGO_URI`, and `USER_CLIENT_URL` / `ADMIN_CLIENT_URL` to your real website addresses (CORS).
2. **client-user** hosting env: `VITE_API_URL=https://your-api-domain`, `VITE_WHATSAPP_NUMBER=91XXXXXXXXXX`.
3. **client-admin** hosting env: `VITE_API_URL=https://your-api-domain`.
4. Run `npm run build` in each client **after** setting its hosting env (Vite bakes these values in at build time) and publish the `dist` folder.
5. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` on the server before production. New product images are uploaded to Cloudinary and their secure URLs are saved in MongoDB. Local development continues to use `server/uploads` when Cloudinary is not configured. Production image uploads fail with a clear error if Cloudinary is not configured, rather than saving files to ephemeral disk.
6. Set `VITE_API_URL` in each frontend's hosting environment to the deployed API URL. For the user site, also set `VITE_WHATSAPP_NUMBER`. Rebuild after setting these values.

## Database Collections
- `users` — registered customers
- `admins` — registered shop admins
- `products` — all dress products
- `otps` — temporary OTP records (auto-expire after 5 minutes)

## Security
- Passwords hashed with bcrypt
- JWT-based authentication with role checks (`user` / `admin`)
- Protected routes on both frontend (PrivateRoute) and backend (middleware)
