const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
const connectDatabase = require('./config/database');
const authRouter = require('./routes/user.route');
const postsRouter = require('./routes/post.route');
const adminRouter = require('./routes/admin.route');

// MIDDLEWARE
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: function(origin, callback) {
    if (origin && origin.startsWith('http://localhost')) {
      callback(null, true);
    } else if (!origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());

// Serve uploaded files when using local storage fallback
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ROUTES
app.get('/', (req, res) => {
  res.json({
    message: 'server is running...'
  });
});

// APPLICATION ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/admin', adminRouter);

const PORT = process.env.PORT || 3000;

// APP LISTENING
app.listen(PORT, async () => {
  await connectDatabase();
  console.log(`Server is running on port ${PORT}`);
});
