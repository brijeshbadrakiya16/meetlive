# Simple Cloud Deployment Guide

## Overview

```
GitHub (Code Repository)
    ↓
Backend → Render
Streaming Server → Render  
Frontend → Vercel
```

---

## Step 1: Set Up GitHub

### 1.1 Create .gitignore

Create `.gitignore` in your project root:

```
node_modules/
.env
.env.local
.env.*.local
dist/
build/
.DS_Store
*.log
```

### 1.2 Initialize Git

```bash
cd c:\Users\brijesh\Desktop\Yudiz\MeetLive

git init
git add .
git commit -m "Initial commit"
```

### 1.3 Push to GitHub

1. Go to https://github.com/new
2. Create new repository: `meetlive`
3. Don't initialize with README (we already have code)
4. Copy the commands shown:

```bash
git remote add origin https://github.com/YOUR_USERNAME/meetlive.git
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub!

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account

1. Go to https://render.com
2. Sign up (can use GitHub account)
3. Click "New +"
4. Select "Web Service"

### 2.2 Connect GitHub Repository

1. Select "Build and deploy from a Git repository"
2. Click "Connect account" → Authorize GitHub
3. Find your repository `meetlive`
4. Click "Connect"

### 2.3 Configure Backend Service

**Fill in these fields:**

| Field | Value |
|-------|-------|
| Name | `meetlive-backend` |
| Environment | `Node` |
| Build Command | `cd backend && npm install` |
| Start Command | `cd backend && npm run dev` |
| Region | Choose closest to you |

### 2.4 Add Environment Variables

1. Click "Advanced"
2. Add environment variable:

| Key | Value |
|-----|-------|
| PORT | `5000` |
| NODE_ENV | `production` |

### 2.5 Deploy

1. Click "Create Web Service"
2. Wait for deploy (5-10 minutes)
3. You'll get a URL like: `https://meetlive-backend.onrender.com`

✅ **SAVE THIS URL** - You'll need it!

---

## Step 3: Deploy Streaming Server to Render

### 3.1 Create Another Render Service

1. Go to https://render.com/dashboard
2. Click "New +"
3. Select "Web Service"
4. Select your GitHub repository again

### 3.2 Configure Streaming Service

**Fill in these fields:**

| Field | Value |
|-------|-------|
| Name | `meetlive-streaming` |
| Environment | `Node` |
| Build Command | `cd streaming_server && npm install` |
| Start Command | `cd streaming_server && npm run dev` |
| Region | Same as backend |

### 3.3 Add Environment Variables

1. Click "Advanced"
2. Add environment variable:

| Key | Value |
|-----|-------|
| PORT | `4000` |
| NODE_ENV | `production` |

### 3.4 Deploy

1. Click "Create Web Service"
2. Wait for deploy
3. You'll get a URL like: `https://meetlive-streaming.onrender.com`

✅ **SAVE THIS URL** - You'll need it!

---

## Step 4: Configure Frontend for Vercel

### 4.1 Update Frontend .env

In `frontend/.env`, replace with your Render URLs:

```env
VITE_STREAMING_SERVER_URL=https://meetlive-streaming.onrender.com
VITE_BACKEND_URL=https://meetlive-backend.onrender.com
VITE_API_URL=https://meetlive-backend.onrender.com
```

**Replace with YOUR actual Render URLs!**

### 4.2 Commit Changes

```bash
git add frontend/.env
git commit -m "Update frontend environment variables for production"
git push
```

---

## Step 5: Deploy Frontend to Vercel

### 5.1 Create Vercel Account

1. Go to https://vercel.com
2. Sign up (use GitHub)
3. Click "Authorize"

### 5.2 Import GitHub Repository

1. Click "New Project"
2. Select "Import Git Repository"
3. Find `meetlive` repository
4. Click "Import"

### 5.3 Configure Build Settings

Vercel should auto-detect, but verify:

| Field | Value |
|-------|-------|
| Framework | `Vite` |
| Build Command | `cd frontend && npm run build` |
| Output Directory | `frontend/dist` |
| Install Command | `npm install` |

### 5.4 Add Environment Variables

Click "Environment Variables" and add:

```
VITE_STREAMING_SERVER_URL=https://meetlive-streaming.onrender.com
VITE_BACKEND_URL=https://meetlive-backend.onrender.com
VITE_API_URL=https://meetlive-backend.onrender.com
```

### 5.5 Deploy

1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. You get URL like: `https://meetlive.vercel.app`

✅ **Your app is live!**

---

## Step 6: Test Your Live App

Open browser:

```
https://meetlive.vercel.app
```

**Open two browsers/devices:**
- Browser 1: Create meeting
- Browser 2: Join meeting
- Click approve
- Both cameras should appear ✅

**Check browser console (F12):**

```
🔌 Connecting to socket server: https://meetlive-streaming.onrender.com
✅ Connected to socket server. Socket ID: xyz123
```

---

## If Something Doesn't Work

### Check Rendering Logs

**Backend logs on Render:**
1. Go to https://render.com/dashboard
2. Click `meetlive-backend`
3. Scroll down to "Logs"
4. Look for errors in red

**Streaming logs:**
1. Click `meetlive-streaming`
2. Check "Logs"

### Check Vercel Logs

1. Go to https://vercel.com/dashboard
2. Click `meetlive` project
3. Click "Deployments"
4. Click latest deployment
5. Scroll down to see build logs

### Common Issues

**Issue:** "Cannot reach streaming server"
- Check: `VITE_STREAMING_SERVER_URL` in Vercel environment variables
- Make sure URL is HTTPS (not HTTP)
- Try accessing URL in browser directly

**Issue:** Render service won't start
- Check: "Build Command" includes `cd backend` or `cd streaming_server`
- Check: "Start Command" has same `cd` path
- Check: Environment variables are set

**Issue:** "Port already in use"
- Render assigns ports automatically
- Don't hardcode port in code
- Use `process.env.PORT || 5000`

---

## Update Your Code After Deployment

**Once you're live:**

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```
3. Render/Vercel **automatically redeploy** ✅

---

## Environment Variables Summary

### Where to Put Them

**Backend (Render):**
- Go to Render Dashboard → meetlive-backend → Settings → Environment Variables
- Add: `NODE_ENV=production`, `PORT=5000`

**Streaming (Render):**
- Go to Render Dashboard → meetlive-streaming → Settings → Environment Variables
- Add: `NODE_ENV=production`, `PORT=4000`

**Frontend (Vercel):**
- Go to Vercel Dashboard → meetlive → Settings → Environment Variables
- Add all `VITE_*` variables

**Local Development (Your Machine):**
- Create files: `backend/.env`, `streaming_server/.env`, `frontend/.env`
- Don't commit `.env` files (gitignore will handle it)

---

## Your Final URLs

Once deployed, you'll have:

| Service | URL | File |
|---------|-----|------|
| Frontend | `https://meetlive.vercel.app` | - |
| Backend | `https://meetlive-backend.onrender.com` | `frontend/.env` |
| Streaming | `https://meetlive-streaming.onrender.com` | `frontend/.env` |

---

## Quick Checklist

- [ ] GitHub account created
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Streaming deployed on Render
- [ ] Frontend `.env` updated with Render URLs
- [ ] Frontend deployed on Vercel
- [ ] Tested at least one meeting
- [ ] Both cameras working ✅

---

## Next Steps

1. Follow Step 1-6 above
2. Test the live app
3. Share the Vercel URL with others to test
4. If issues, check logs in Render/Vercel dashboards

That's it! You're deployed! 🚀
