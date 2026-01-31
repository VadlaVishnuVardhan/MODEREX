const express = require('express');
const {
  getAllPosts,
  getUserPosts,
  createPost,
  likePost,
  addComment,
  deletePost,
  deleteComment,
} = require('../controllers/post.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadFiles } = require('../utils/utils');

const postsRouter = express.Router();

// Public routes first
postsRouter.get('/', getAllPosts);
postsRouter.get('/user/:userId', getUserPosts);

// Protected routes
postsRouter.post('/create', uploadFiles.single('media'), authMiddleware, createPost);
postsRouter.post('/:postId/like', authMiddleware, likePost);
postsRouter.post('/:postId/comment', authMiddleware, addComment);
postsRouter.delete('/:postId/comment/:commentId', authMiddleware, deleteComment);
postsRouter.delete('/:postId', authMiddleware, deletePost);

module.exports = postsRouter;

