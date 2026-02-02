# AI Content Moderation System - Setup Guide

This document explains how to set up and use the OpenAI-powered content moderation system in Moderex.

## Features

- **Automatic AI Moderation**: All comments are automatically checked using OpenAI's Moderation API
- **Real-time Flagging**: Inappropriate content is flagged instantly
- **Admin Dashboard**: Review and manage flagged content
- **Category Detection**: Detects hate speech, self-harm, sexual content, violence, spam, and more
- **Auto-rejection**: Severe content violations are automatically rejected

## Backend Setup

### 1. Install Dependencies

The OpenAI SDK has already been installed:
```bash
cd backend
npm install
```

### 2. Configure OpenAI API Key

1. Get your OpenAI API key from https://platform.openai.com/api-keys
2. Open `backend/.env` and add your API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Database Setup

The system uses two main collections:
- **posts**: Updated with moderation data in comments
- **flaggedcontents**: Stores all flagged content for admin review

MongoDB will automatically create these collections when you start using the system.

### 4. Create an Admin User

To access the admin dashboard, you need to manually set a user as admin in MongoDB:

```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "your-admin-email@example.com" },
  { $set: { isAdmin: true } }
)
```

Or use MongoDB Compass:
1. Open the `users` collection
2. Find your user
3. Add field: `isAdmin: true`