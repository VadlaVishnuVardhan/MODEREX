# TODO: Fix Profile Upload Issues

## Tasks
- [x] Fix userProfileUpload logic in backend/src/controllers/auth.controller.js to handle production (Cloudinary) and development (local) correctly
- [x] Fix Cloudinary API key environment variable name in backend/src/index.js to match utils.js
- [x] Investigate and fix image loading error (ERR_BLOCKED_BY_CLIENT) if persists after fixes
- [ ] Test profile upload in both environments
