# Mixed Content Fix TODO

## Completed Tasks
- [x] Analyzed the mixed content issue: HTTPS frontend loading HTTP images from localhost:3000/uploads/
- [x] Changed URL construction in auth.controller.js to use relative paths (/uploads/filename)
- [x] Changed URL construction in post.controller.js to use relative paths (/uploads/posts/filename)
- [x] Added Vite proxy in vite.config.js to proxy /uploads to http://localhost:3000 for local development
- [x] Added Vercel rewrite in vercel.json to proxy /uploads to backend domain for production
- [x] Fixed CORS configuration to allow the actual Vercel domain (https://moderex-gadie4ud6-vadla-vishnu-vardhans-projects.vercel.app)
- [x] Updated vercel.json with the actual backend URL (https://moderex.onrender.com)

## Remaining Tasks
- [ ] Test local development: Start frontend and backend, verify images load without mixed content warnings
- [ ] Test production: Deploy backend changes and verify images load correctly on Vercel

## Notes
- Backend is deployed on Render (https://moderex.onrender.com) with HTTPS
- Frontend is deployed on Vercel with the correct CORS and proxy configurations
