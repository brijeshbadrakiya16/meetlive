# Where to Put Your Hosting Links

## 🎯 After Getting URLs from Render & Vercel

Once you deploy all three services, you'll have URLs like:

```
Backend:     https://meetlive-backend.onrender.com
Streaming:   https://meetlive-streaming.onrender.com
Frontend:    https://meetlive.vercel.app
```

---

## 📁 Where to Put These URLs

### ✅ In `frontend/.env` File

This is the **ONLY place** you need to put the URLs:

```bash
# File: frontend/.env

VITE_STREAMING_SERVER_URL=https://meetlive-streaming.onrender.com
VITE_BACKEND_URL=https://meetlive-backend.onrender.com
VITE_API_URL=https://meetlive-backend.onrender.com
```

**Replace** `meetlive-streaming` and `meetlive-backend` with **YOUR actual Render service names!**

---

## 🚀 Step-by-Step: Where to Put URLs

### Step 1: Get URLs from Render

**For Backend:**
1. Go to render.com/dashboard
2. Click "meetlive-backend" service
3. Top of page shows: `https://meetlive-backend-XXXXX.onrender.com`
4. **Copy this URL**

**For Streaming:**
1. Click "meetlive-streaming" service
2. Top shows: `https://meetlive-streaming-XXXXX.onrender.com`
3. **Copy this URL**

### Step 2: Update frontend/.env

Open: `frontend/.env`

```
VITE_STREAMING_SERVER_URL=https://meetlive-streaming-XXXXX.onrender.com
VITE_BACKEND_URL=https://meetlive-backend-XXXXX.onrender.com
VITE_API_URL=https://meetlive-backend-XXXXX.onrender.com
```

### Step 3: Push to GitHub

```bash
git add frontend/.env
git commit -m "Update production URLs"
git push
```

### Step 4: Add Same URLs to Vercel

**When deploying frontend on Vercel:**
1. In Vercel dashboard
2. Go to Settings → Environment Variables
3. Add same variables:
   ```
   VITE_STREAMING_SERVER_URL=https://meetlive-streaming-XXXXX.onrender.com
   VITE_BACKEND_URL=https://meetlive-backend-XXXXX.onrender.com
   VITE_API_URL=https://meetlive-backend-XXXXX.onrender.com
   ```

---

## ❌ Places NOT to Put URLs

- ❌ Don't hardcode in `src/utils/socketService.js` (it reads from `.env`)
- ❌ Don't put in `backend/server.js` (backend doesn't need frontend URL)
- ❌ Don't put in `streaming_server/stream_server.js` (server doesn't need frontend URL)
- ❌ Don't commit `.env` file to GitHub (it's in `.gitignore`)

---

## 📋 File Locations Reference

```
MeetLive/
├── backend/
│   ├── server.js           ← No changes needed
│   └── .env (local only)   ← Local environment, don't commit
├── streaming_server/
│   ├── stream_server.js    ← No changes needed
│   └── .env (local only)   ← Local environment, don't commit
├── frontend/
│   ├── src/
│   │   ├── utils/
│   │   │   └── socketService.js  ← No changes, reads from .env
│   │   └── ...
│   └── .env                ← UPDATE WITH RENDER URLs
├── .gitignore
└── DEPLOY_GITHUB_RENDER_VERCEL.md
```

---

## 🔄 Local Development vs Production

### Your Laptop (Local Development)

`frontend/.env`:
```
VITE_STREAMING_SERVER_URL=http://localhost:4000
VITE_BACKEND_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
```

Run locally: `npm run dev`

### Render + Vercel (Production)

`frontend/.env`:
```
VITE_STREAMING_SERVER_URL=https://meetlive-streaming.onrender.com
VITE_BACKEND_URL=https://meetlive-backend.onrender.com
VITE_API_URL=https://meetlive-backend.onrender.com
```

This is what goes to production ✅

---

## 🧪 How It Works

1. **Frontend code** reads from `frontend/.env` at build time
2. `socketService.js` uses: `import.meta.env.VITE_STREAMING_SERVER_URL`
3. When you deploy to Vercel, Vercel reads the `.env` file
4. Frontend JavaScript connects to the URLs in `.env`
5. Socket.io connections reach your Render servers

---

## ✅ Testing After Deployment

1. Go to your Vercel URL: `https://meetlive.vercel.app`
2. Open browser F12 Console
3. You should see:
   ```
   🔌 Connecting to socket server: https://meetlive-streaming.onrender.com
   ✅ Connected to socket server. Socket ID: abc123
   ```

If you see:
```
❌ Socket connection error
```

Check:
- Is `VITE_STREAMING_SERVER_URL` in Vercel environment variables?
- Does it have `https://`?
- Is Render service running? (Check Render dashboard)

---

## Summary

**Only thing you need to do:**

1. Deploy backend & streaming to Render (get 2 URLs)
2. Put those 2 URLs in `frontend/.env`
3. Commit and push
4. Deploy frontend to Vercel
5. Done! ✅

**That's it! No other files need changes!**
