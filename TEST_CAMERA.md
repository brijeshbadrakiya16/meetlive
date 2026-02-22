# MeetLive Camera Fix - Testing Instructions

## What Was Fixed

1. **Localhost Camera Issue**
   - Added guard in Meeting.jsx to ensure localStream is ready before WebRTC negotiation
   - Added logging to WebRTC service to show when tracks are being added
   - Fixed timing issue where participant camera wasn't being displayed

2. **Backend Server**
   - Now listening on 0.0.0.0 instead of just localhost
   - Supports network IP access (10.143.45.156)

3. **Socket Service**
   - Better logging for ngrok and network IP scenarios
   - Clearer error messages when can't connect

4. **Environment Variables**
   - Can now set VITE_STREAMING_SERVER_URL for custom scenarios (ngrok, etc)

## Test Steps

### Test 1: Localhost Two Browsers (Camera Fix)

**Prerequisites:**
- Ensure all servers are stopped
- Delete `frontend/node_modules` and run `npm install` again if npm had errors
- Same with `backend` and `streaming_server`

**Step 1: Start all 3 servers**

Terminal 1:
```bash
cd streaming_server
npm run dev
```

Wait for: `✅ Streaming server running on http://0.0.0.0:4000`

Terminal 2:
```bash
cd backend
npm run dev
```

Wait for: `✅ Backend server running`

Terminal 3:
```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173`

**Step 2: Open two browsers**

Browser 1 (Chrome):
- Open: `http://localhost:5173`
- Press F12 for Console
- Enter name (e.g., "John")
- Click "+ Host a Meeting"
- **WRITE DOWN the meeting code** (e.g., ABC123)

Browser 2 (Firefox or Chrome Incognito):
- Open: `http://localhost:5173`
- Press F12 for Console
- Enter different name (e.g., "Jane")
- Paste meeting code
- Click "Join Meeting"
- **Wait for page to fully load**

**Step 3: Watch Console**

In Browser 2 (Participant), look for:
```
⏳ Waiting for local stream before setting up listeners...
✅ Local stream ready, setting up listeners
📹 Adding 2 tracks for peer [HOST_ID]
   ➕ Adding track: audio
   ➕ Adding track: video
```

**Step 4: Host approves**

In Browser 1:
- Click yellow button (showing "1")
- Modal opens showing participant
- Click "Approve"

**Step 5: Check for Camera**

In Browser 2 (Participant), look for:
```
🎬 Creating ANSWER for peer [HOST_ID]
   Setting remote description (offer)
   Setting local description (answer)
✅ ANSWER created for [HOST_ID]
📹 Remote track received from [HOST_ID]: video
```

**Expected Result:**
- Both browsers should show each other's video
- Host's camera in large box
- Participant's camera in bottom right corner  
- Both should see each other talking

If participant camera still blank:
1. Check console for `📹 Remote track received from`
2. If not there, check logs for errors
3. Report the exact console output

### Test 2: Network IP (LAN)

**Prerequisites:**
- Both devices on same WiFi network
- Windows Firewall allows ports 4000, 5000, 5173

See `SETUP_NETWORK_IP.md` for detailed instructions.

**Quick Test:**

Server machine, open PowerShell:
```powershell
ipconfig | findstr "IPv4"
```

Get the IP like: `10.143.45.156`

Client machine browser:
```
http://10.143.45.156:5173
```

Check F12 console:
```
🔌 Connecting to socket server: http://10.143.45.156:4000
✅ Connected to socket server
```

If seeing `❌ connection error`, firewall is blocking port 4000.

### Test 3: Ngrok

See `SETUP_NGROK.md` for detailed instructions.

**Quick Test:**

Terminal 4:
```bash
ngrok http 5173
```

Get URL: `https://abc123-ngrok.io`

Create `frontend/.env`:
```env
VITE_STREAMING_SERVER_URL=https://ghi789-ngrok.io
VITE_BACKEND_URL=https://def456-ngrok.io
```

(Replace ghi789-ngrok.io with YOUR streaming server ngrok URL)

Browser:
```
https://abc123-ngrok.io
```

Console should show:
```
🔌 Using VITE_STREAMING_SERVER_URL from env: https://ghi789-ngrok.io
✅ Connected to socket server
```

## Console Emoji Legend

| Emoji | Meaning |
|-------|---------|
| 🔌 | Socket connection |
| ✅ | Success |
| ❌ | Error |
| 📡 | Listener registered |
| 📨 | Event received |
| 📞 | Join action |
| 🏠 | Host action |
| 📹 | Camera/video tracks |
| ➕ | Adding tracks |
| ⏳ | Waiting |
| 🎬 | Creating offer/answer |

## What to Include When Reporting Issues

**Screenshot 1: Server Terminal Output**
- Show all 3 servers running
- Show "listening" or "running" messages
- Any errors in red

**Screenshot 2: Browser 1 (Host) Console**
- F12 console logs
- Look for errors in red
- Look for ✅ socket connected

**Screenshot 3: Browser 2 (Participant) Console**
- F12 console logs
- Look for 📹 tracks being added
- Look for remote track received

**Screenshots 4-5: Video Grid**
- What does each person see?
- Host's camera showing?
- Participant's camera showing?
- Both showing? One blank?

**Describe Issue:**
- "Host camera shows, participant camera is blank"
- "Both cameras are black"
- "Can't connect at all"
- etc.

**Steps to Reproduce:**
- Exact steps you took
- What you expected vs what happened

## Quick Fixes to Try First

1. **Refresh both browsers**
   - F5 on both
   - Wait 2 seconds
   - Try again

2. **Clear cache**
   - Ctrl+Shift+Delete
   - Clear all data
   - Refresh

3. **Restart servers**
   - Stop all (Ctrl+C)
   - Kill any remaining node processes
   - Start all fresh

4. **Delete node_modules**
   ```bash
   cd frontend && rm -r node_modules && npm install
   cd ../backend && rm -r node_modules && npm install
   cd ../streaming_server && rm -r node_modules && npm install
   ```

5. **Check firewall (for network IP)**
   - Windows Defender → Firewall → Allow apps
   - Port 4000, 5000, 5173 should be allowed

---

**Last Updated: Feb 2026**

## Next Steps

1. Run Test 1 (localhost)
2. Check console logs
3. Report exact errors or confirmation that it works
4. Then try Test 2 (network IP)
5. Then try Test 3 (ngrok) if needed
