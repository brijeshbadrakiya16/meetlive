# Quick Setup - Ngrok HTTPS Tunneling

## Use Case
You want to share MeetLive publicly or test HTTPS connection.

## Install Ngrok

Go to: https://ngrok.com/download

Download and install, or use:
```powershell
choco install ngrok
```

Sign up for free account: https://ngrok.com/

## Method 1: Individual Ngrok Tunnels (Recommended)

Each service gets its own ngrok URL.

### Step 1: Start All 3 Servers

**Terminal 1 (Streaming Server):**
```bash
cd streaming_server
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 3 (Frontend):**
```bash
cd frontend
npm run dev
```

### Step 2: Create Ngrok Tunnels

**Terminal 4 (Frontend Ngrok):**
```bash
ngrok http 5173
```

You'll see:
```
Session Status                online
Version                       X.X.X
...
Forwarding    https://abc123-ngrok.io -> http://localhost:5173
```

**COPY this URL:** `https://abc123-ngrok.io`

**Terminal 5 (Backend Ngrok):**
```bash
ngrok http 5000
```

**COPY this URL:** `https://def456-ngrok.io`

**Terminal 6 (Streaming Ngrok):**
```bash
ngrok http 4000
```

**COPY this URL:** `https://ghi789-ngrok.io`

### Step 3: Configure Environment Variables

**In your frontend folder, create `.env` file:**

```env
VITE_STREAMING_SERVER_URL=https://ghi789-ngrok.io
VITE_BACKEND_URL=https://def456-ngrok.io
```

Replace with YOUR ngrok URLs from Step 2!

### Step 4: Restart Frontend Dev Server

Terminal 3, stop with Ctrl+C, then:
```bash
npm run dev
```

### Step 5: Access via Ngrok

Open in browser:
```
https://abc123-ngrok.io
```

**Check browser console (F12):**

Should see:
```
🔌 Using VITE_STREAMING_SERVER_URL from env: https://ghi789-ngrok.io
✅ Connected to socket server. Socket ID: xyz123
```

## Method 2: Single Tunnel with All Services

Only works if all 3 services run on same port - not practical.

---

## Testing with Two Browsers

**Browser 1 (Host):**
```
https://abc123-ngrok.io
```

**Browser 2 (Participant):**
```
https://abc123-ngrok.io
(different browser or incognito mode)
```

Same process as localhost, but with HTTPS and public URL.

## Troubleshooting

### "Failed to connect to streaming server"

Check:
1. `.env` has correct `VITE_STREAMING_SERVER_URL`
2. Is it the FULL ngrok URL with `https://`?
3. Is Streaming Ngrok tunnel still running?
4. Copy exact URL including trailing slashes if any

### "SSL Certificate Error"

- This is normal for ngrok
- Click "Advanced" → "Continue" or "Proceed anyway"
- Or ngrok provides warnings you can bypass

### "Socket connection timeout"

1. Check browser console
2. Should show connecting to correct URL
3. Stop and restart ngrok tunnel
4. Don't close tunnel windows!

### Can't see other person's camera

See: `SETUP_GUIDE.md` → Issue 1

---

## Tips

1. **Keep ngrok terminals open** - Don't close them while testing
2. **URLs change each time** - Each ngrok restart generates new URL
3. **Use ngrok web dashboard** - Visit `http://localhost:4040` to see traffic
4. **Share ngrok URL** - Give `https://abc123-ngrok.io` to others for testing
5. **Premium accounts** - Get the same URL each time (paid feature)

## Quick Menu for Environment Variables

Copy one of these to your `frontend/.env`:

**For localhost:**
```env
VITE_STREAMING_SERVER_URL=http://localhost:4000
VITE_BACKEND_URL=http://localhost:5000
```

**For Network IP (e.g., 10.143.45.156):**
```env
VITE_STREAMING_SERVER_URL=http://10.143.45.156:4000
VITE_BACKEND_URL=http://10.143.45.156:5000
```

**For Ngrok (replace with your URLs):**
```env
VITE_STREAMING_SERVER_URL=https://ghi789-ngrok.io
VITE_BACKEND_URL=https://def456-ngrok.io
```

Then restart `npm run dev` in frontend folder.

---

## Ngrok Command Reference

```bash
# Basic HTTP tunnel
ngrok http 5173

# HTTPS tunnel (with self-signed cert warning)
ngrok http 5173 --scheme https

# Specify custom URL (premium only)
ngrok http -subdomain=meetlive 5173

# View tunnel web dashboard
# Open: http://localhost:4040

# List all running sessions
ngrok api tunnels list
```

