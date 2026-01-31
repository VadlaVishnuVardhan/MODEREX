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

## Frontend Setup

No additional configuration needed. The frontend components are already integrated.

## How It Works

### Comment Moderation Pipeline

1. **User submits comment** → Comment is sent to backend
2. **AI Moderation** → OpenAI API analyzes the content
3. **Flagging Decision**:
   - **Clean**: Comment is posted immediately
   - **Flagged**: Comment is posted but marked for review
   - **Severe**: Comment is auto-rejected (hate/threatening, self-harm, sexual/minors, violence/graphic)
4. **Admin Review** → Admin can approve or reject flagged content
5. **Action**: Rejected comments are removed from posts

### Moderation Categories

The system detects:
- **hate**: Hate speech
- **hate/threatening**: Threatening hate speech
- **self-harm**: Self-harm content
- **sexual**: Sexual content
- **sexual/minors**: Sexual content involving minors
- **violence**: Violent content
- **violence/graphic**: Graphic violence

## API Endpoints

### Comments
- `POST /api/v1/posts/:postId/comment` - Add comment (with moderation)

### Admin (Requires admin privileges)
- `GET /api/v1/admin/flagged` - Get flagged content (with filters)
- `POST /api/v1/admin/flagged/:flaggedId/review` - Review flagged content
- `GET /api/v1/admin/stats` - Get moderation statistics

## Usage

### For Users

1. **Commenting**: Simply add comments to posts as usual
2. **Flagged Comments**: If your comment is flagged, you'll see a warning message
3. **Visibility**: Flagged comments show a yellow badge with the category

### For Admins

1. **Access Dashboard**: Click "Admin Dashboard" in the sidebar (only visible to admins)
2. **View Flagged Content**: See all content flagged by the AI
3. **Filter**: Filter by status (pending/approved/rejected) or content type
4. **Review**:
   - ✅ **Approve**: Keep the content (mark as false positive)
   - ❌ **Reject**: Remove the content permanently
5. **Stats**: View moderation statistics and category breakdown

## Testing the System

### Test Comments (for development)

Try posting these comments to see how moderation works:

**Clean Content** (should pass):
```
"Great post! I really enjoyed this."
"Thanks for sharing this content."
```

**Flagged Content** (will be flagged but posted):
```
"This is stupid and you're an idiot"
"I hate this so much"
```

**Auto-rejected Content** (will be blocked):
```
"[Severe hate speech or threatening content]"
"[Content involving minors]"
```

## Troubleshooting

### OpenAI API Key Not Working

**Error**: Comments are posted without moderation
**Solution**: 
1. Verify your API key is correct in `.env`
2. Check you have credits in your OpenAI account
3. Restart the backend server after updating `.env`

### Admin Dashboard Not Accessible

**Error**: "Admin access required" message
**Solution**: 
1. Ensure your user has `isAdmin: true` in the database
2. Log out and log back in (JWT token needs to be refreshed)

### Comments Not Showing

**Solution**:
1. Check browser console for errors
2. Verify backend is running on port 3000
3. Check CORS configuration

## Configuration Options

### Moderation Sensitivity

To adjust which content is auto-rejected, edit:
`backend/src/services/moderation.service.js`

```javascript
function shouldAutoReject(moderation) {
  // Customize these categories based on your needs
  const highSeverityCategories = [
    'hate/threatening',
    'self-harm',
    'sexual/minors',
    'violence/graphic',
  ];
  // ...
}
```

### Fail-Open vs Fail-Closed

Currently set to **fail-open** (allow content if moderation fails).

To change to **fail-closed** (reject content if moderation fails):

Edit `backend/src/services/moderation.service.js`:
```javascript
// In the catch block, change:
return {
  flagged: true,  // Change from false to true
  // ...
}
```

## Production Considerations

1. **Rate Limits**: OpenAI has rate limits. Consider implementing caching or request queuing
2. **Costs**: Each moderation call costs money. Monitor your usage
3. **Privacy**: Content is sent to OpenAI. Review their privacy policy
4. **Performance**: Consider async moderation for high-traffic sites
5. **Monitoring**: Set up alerts for high volumes of flagged content

## Support

For issues or questions:
1. Check the console logs (backend and frontend)
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check MongoDB connection

## Next Steps

- Implement post content moderation (not just comments)
- Add moderation webhooks for notifications
- Create moderation analytics dashboard
- Implement user reputation system
- Add appeal system for rejected content
