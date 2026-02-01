# TODO: Fix Mixed Content Error by Removing Local Uploads

- [x] Edit `backend/src/controllers/auth.controller.js` to remove local upload fallback and use only Cloudinary URLs for profile uploads.
- [ ] Deploy the changes to production.
- [ ] Test profile image upload to ensure it returns a Cloudinary HTTPS URL.
- [ ] Instruct existing users with local URLs in the database to upload new profile images to replace them.
