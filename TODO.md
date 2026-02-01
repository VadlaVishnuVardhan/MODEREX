# TODO: Fix Profile Image Issues

## Problem 1: Still Using localhost Image URL
- Console shows: http://localhost:3000/uploads/profile-xxxx.jpg
- Old profile URL is still stored in database
- Cloudinary upload is NOT being used yet
- Mixed content error happens
- Fix: Re-upload profile image AFTER Cloudinary fix deployment

## Problem 2: CORS BLOCKING PROFILE UPLOAD (PATCH)
- Error: Method PATCH is not allowed by Access-Control-Allow-Methods
- Backend CORS config allows only: GET, POST, PUT, DELETE, OPTIONS
- Profile upload uses: PATCH
- Fix: Update CORS config to include PATCH

## Tasks
- [ ] Update CORS config in `backend/src/index.js` to include PATCH
- [ ] Fix logic in `userProfileUpload` to use Cloudinary in production
- [ ] Run `fixProfileImages.js` to update existing localhost URLs to production URLs
- [ ] Test profile upload after fixes
