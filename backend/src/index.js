const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const connectDatabase = require('./config/database');
const authRouter = require('./routes/user.route');
const postsRouter = require('./routes/post.route');
const adminRouter = require('./routes/admin.route');

const app = express();

// ===================== CORS (FINAL SAFE CONFIG) =====================

// IMPORTANT: Put CORS FIRST (before routes, cookies, body parsers)

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cors({
  credentials: true
}));

// ===================================================================

// BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// STATIC FILES
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
