# Mixed Content Fix TODO

## Completed Tasks
- [x] Analyzed the mixed content issue: HTTPS frontend loading HTTP images from localhost:3000/uploads/
- [x] Changed URL construction in auth.controller.js to use relative paths (/uploads/filename)
- [x] Changed URL construction in post.controller.js to use relative paths (/uploads/posts/filename)
- [x] Added Vite proxy in vite.config.js to proxy /uploads to http://localhost:3000 for local development
- [x] Added Vercel rewrite in vercel.json to proxy /uploads to backend domain for production
- [x] Fixed CORS configuration to allow multiple Vercel domains
- [x] Updated vercel.json with the actual backend URL (https://moderex.onrender.com)

## Remaining Tasks
- [ ] Redeploy backend to Render with updated CORS configuration
- [ ] Redeploy frontend to Vercel with updated vercel.json
- [ ] Test production: Verify images load without mixed content warnings and API requests work

## Notes
- Backend is deployed on Render (https://moderex.onrender.com) with HTTPS
- Frontend is deployed on Vercel with the correct CORS and proxy configurations
- CORS now allows multiple Vercel domains to handle dynamic deployment URLs
