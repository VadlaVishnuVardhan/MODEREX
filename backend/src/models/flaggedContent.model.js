const { Schema, model } = require('mongoose');

const flaggedContentSchema = new Schema({
  contentType: {
    type: String,
    enum: ['comment', 'post'],
    required: true,
  },
  contentId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  moderation: {
    flagged: Boolean,
    categories: Schema.Types.Mixed,
    categoryScores: Schema.Types.Mixed,
    moderatedAt: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
}, { timestamps: true });

// Index for efficient queries
flaggedContentSchema.index({ status: 1, createdAt: -1 });
flaggedContentSchema.index({ postId: 1 });
flaggedContentSchema.index({ userId: 1 });

const FlaggedContent = model('FlaggedContent', flaggedContentSchema);

module.exports = FlaggedContent;
