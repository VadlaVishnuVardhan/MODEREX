# Profile Image Fixes TODO

## Backend Fixes
- [x] Replace userProfileUpload in auth.controller.js to force Cloudinary only, remove local fallback

## Frontend Fixes
- [x] Add resolveImageUrl function to formatters.js
- [x] Update Profile.jsx to use resolveImageUrl for profile image src
- [x] Remove manual Content-Type header in AuthProvider.jsx for profile upload

## Testing
- [x] Code changes implemented and syntax verified
- [x] Ready for production deployment testing
