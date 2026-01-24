# Production Deployment Architecture

The root cause of your "Network Error" is trying to run a persistent Express/Socket.io app on Vercel Serverless. This architecture is invalid.

## The Solution: Split Deployment

1.  **Frontend**: Stays on **Vercel** (Static Assets + React).
2.  **Backend**: Moves to **Render** (Persistent Node.js Server).

## Part 1: Deploy Backend to Render

1.  Push your code to GitHub.
2.  Go to [dashboard.render.com](https://dashboard.render.com) and create a **New Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    -   **Root Directory**: `backend`
    -   **Build Command**: `./render-build.sh` (I created this script for you)
    -   **Start Command**: `node server.js`
5.  **Environment Variables** (Add these in Render Dashboard):
    -   `NODE_ENV`: `production`
    -   `MONGO_URI`: `mongodb+srv://...` (Your MongoDB Atlas URL, **NOT localhost**)
    -   `JWT_SECRET`: (Your secret key)
    -   `FRONTEND_URL`: `https://cloud-kitchen-frontend.vercel.app` (Your Vercel URL)

**Wait for deployment to succeed.** Render will give you a URL like `https://food-backend.onrender.com`.

## Part 2: Configure Frontend (Vercel)

1.  Go to your **Vercel Dashboard** > Select Project > Settings > Environment Variables.
2.  Update `VITE_API_URL`:
    -   Value: `https://food-backend.onrender.com` (The URL Render gave you).
3.  Set `VITE_ENABLE_SOCKET`: `true` (Socket.io works on Render!).
4.  **Redeploy** the frontend.

## Part 3: Verify

1.  Open your Vercel URL on your phone.
2.  The "Network Debugger" (if visible) should show "Connected".
3.  Login and Real-time features will work because Render supports persistent connections.

> [!NOTE]
> Render (Free Tier) spins down after inactivity. The first request might take 50 seconds. This is normal for free tier.
