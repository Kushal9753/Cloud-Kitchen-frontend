# Production Deployment Guide (Vercel & Backend)

## 1. Frontend (Vercel) Configuration

Your frontend is trying to connect to `localhost` because it doesn't know where your production backend is. You must set the `VITE_API_URL` environment variable in Vercel.

### Steps to Fix "Localhost" Requests:
1. Go to your **Vercel Dashboard** > Select your Project.
2. Navigate to **Settings** > **Environment Variables**.
3. Add the following variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-production-backend.com`
     (Replace with the actual URL where you deployed your backend, e.g., on Render, Railway, or Heroku. If you haven't deployed the backend yet, you must do that first!)

4. **Redeploy** your frontend for the changes to take effect.

## 2. Backend Configuration

To fix CORS errors (401/403/Network Error), your backend must explicit allow requests from your Vercel domain.

### Environment Options
I have updated `server.js` to automatically allow:
- `https://cloud-kitchen-frontend.vercel.app`
- Any URL specified in `FRONTEND_URL` environment variable.

### If deploying Backend to Render/Railway:
Set the following environment variable on your backend host:
- **Key**: `FRONTEND_URL`
- **Value**: `https://cloud-kitchen-frontend.vercel.app` (or your custom domain)

## 3. Troubleshooting

- **404 Not Found**: Ensure you are hitting the full path `/api/auth/login`.
- **CORS Error**: Check browser console. If it says "Missing Allow-Origin", your backend isn't acknowledging the Vercel domain. Verify `server.js` is deployed with the latest changes.
- **Mixed Content Error**: If your frontend is HTTPS (Vercel default) but backend is HTTP, the browser will block requests. **Your backend MUST have SSL (HTTPS).** Most cloud providers (Render, Railway, Heroku) provide this by default.
