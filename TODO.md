# Mixed Content Fix TODO

## Completed Tasks
- [x] Analyzed the mixed content issue: HTTPS frontend loading HTTP images from localhost:3000/uploads/
- [x] Changed URL construction in auth.controller.js to use relative paths (/uploads/filename)
- [x] Changed URL construction in post.controller.js to use relative paths (/uploads/posts/filename)
- [x] Added Vite proxy in vite.config.js to proxy /uploads to http://localhost:3000 for local development
- [x] Added Vercel rewrite in vercel.json to proxy /uploads to backend domain for production (placeholder)

## Remaining Tasks
- [ ] Deploy backend to HTTPS domain and update vercel.json with actual backend URL
- [ ] Test local development: Start frontend and backend, verify images load without mixed content warnings
- [ ] Test production: Deploy and verify images load correctly on Vercel

## Notes
- For production, replace "https://your-backend-domain.com" in vercel.json with the actual deployed backend URL
- Backend must be deployed on a domain that supports HTTPS
