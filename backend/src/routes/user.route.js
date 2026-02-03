const express  = require('express');
const { userRegister, userLogin, userLogout, userProfile, userProfileUpload } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadFiles } = require('../utils/utils');
const authRouter = express.Router();

authRouter.get('/profile',authMiddleware,userProfile);
authRouter.post('/register', uploadFiles.single('profileImage'), userRegister);
authRouter.post('/login',userLogin);
authRouter.post('/logout', authMiddleware ,userLogout);
authRouter.patch(
  '/profile-upload',
  uploadFiles.single('profile'),
  authMiddleware,
  userProfileUpload,
);

// Debug endpoint to check admin status
authRouter.get('/debug', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: req.user.isAdmin ? 'You are an admin!' : 'You are NOT an admin'
  });
});

module.exports = authRouter;