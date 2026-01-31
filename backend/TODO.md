# TODO: AI Moderation for Posts

## Completed Tasks
- [x] Add moderation field to Post model
- [x] Modify createPost controller to moderate post content (title + description)
- [x] Handle flagged posts: create FlaggedContent record for flagged posts
- [x] Auto-reject posts with high-severity violations
- [x] Update admin controller to handle post rejection (delete post)
- [x] Verify admin dashboard can display flagged posts (already supported)

## Testing
- [ ] Test creating a post with inappropriate content to verify moderation works
- [ ] Test admin dashboard shows flagged posts
- [ ] Test approving/rejecting flagged posts

## Notes
- Posts are moderated during creation using OpenAI Moderation API
- Flagged posts are stored in FlaggedContent collection with contentType: 'post'
- Admin dashboard already supports displaying posts via FilterPanel (contentType: 'post')
- Rejected posts are deleted from the database
- Auto-rejection for high-severity categories (hate/threatening, self-harm, sexual/minors, violence/graphic)
