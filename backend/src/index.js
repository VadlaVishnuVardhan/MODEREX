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

// ===================== CORS CONFIG =====================

app.use(cors({
  origin: ['https://moderex.vercel.app'],
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
