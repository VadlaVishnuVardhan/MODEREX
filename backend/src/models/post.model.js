const { Schema, model } = require('mongoose');

const postSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: String,
  description: String,
  type: {
    type: String,
    enum: ['post', 'reel'],
    default: 'post',
  },
  image: {
    url: String,
    public_id: String,
  },
  video: {
    url: String,
    public_id: String,
  },
  moderation: {
    flagged: Boolean,
    categories: Schema.Types.Mixed,
    categoryScores: Schema.Types.Mixed,
    moderatedAt: Date,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  comments: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      text: String,
      moderation: {
        flagged: Boolean,
        categories: Schema.Types.Mixed,
        categoryScores: Schema.Types.Mixed,
        moderatedAt: Date,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Post = model('Post', postSchema);

module.exports = Post;
