# Mobile & Production Troubleshooting

## Problem: "Network Error" on Mobile

If your app works on Desktop but fails on Mobile with `http://localhost:5000`:
- **Cause**: Mobile devices cannot access `localhost` on your computer. `localhost` on a phone refers to the phone itself.
- **Fix**: You MUST deploy your backend to a public URL (Render, Railway, Heroku, etc.) and configure your frontend to point to it.

## Problem: Mixed Content (HTTP on HTTPS)

- **Cause**: Vercel serves your frontend over **HTTPS**. If `VITE_API_URL` points to an **HTTP** backend (like an un-configured EC2 instance or localhost), the browser will block the request.
- **Fix**: Ensure your backend hosting provides SSL (HTTPS). Most modern platforms (Render, Railway) do this automatically.

## How to Verify
1. Open your specific frontend URL (e.g., `https://cloud-kitchen-frontend.vercel.app`).
2. Open **Developer Tools** (F12) -> **Network** tab.
3. Refresh the page.
4. Filter by **Fetch/XHR**.
5. Look at the **Request URL**.
   - ✅ Correct: `https://your-backend.com/api/auth/me`
   - ❌ Incorrect: `http://localhost:5000/api/auth/me` (Env var missing)
   - ❌ Incorrect: `https://cloud-kitchen-frontend.vercel.app/api/auth/me` (Relative path used but backend not proxied)

## Configuration Checklist
- [ ] Backend deployed to public URL (e.g. `https://my-api.onrender.com`)
- [ ] `VITE_API_URL` set in Vercel Environment Variables to that URL.
- [ ] `VITE_ENABLE_SOCKET` set to `false` (unless using a VPS backend).
