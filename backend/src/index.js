const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});
console.log("cloudinary configured");
console.log("Cloudinary Name:", process.env.CLOUDINARY_CLOUD_NAME);

const connectDatabase = require('./config/database');
const authRouter = require('./routes/user.route');
const postsRouter = require('./routes/post.route');
const adminRouter = require('./routes/admin.route');

const app = express();

// ✅ REQUIRED FOR RENDER HTTPS COOKIE FIX
app.set("trust proxy", 1);

// ===================== UNIVERSAL CORS FIX (FINAL) =====================

const allowedOrigins = [
  "http://localhost:5173",
  "https://moderex.vercel.app"
];

app.use((req, res, next) => {

  const origin = req.headers.origin;

  if (
    allowedOrigins.includes(origin) ||
    origin?.includes("vercel.app")
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // ✅ Preflight Fix
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ============================================================

// BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// STATIC FILES WITH CORS
app.use('/uploads', (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// TEST ROUTE
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running successfully 🚀'
  });
});

// API ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/admin', adminRouter);

// SERVER START
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectDatabase();
  console.log(`Server running on port ${PORT}`);
});
