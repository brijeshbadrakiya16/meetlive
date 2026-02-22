# MeetLive Setup Guide - Camera & Network Issues

## Issue 1: Localhost Camera Problem
**Problem:** Host camera shows, but participant camera doesn't show

**Root Cause:** Timing issue with local stream availability

### Solution: Wait for Stream Before Joining

The participant's camera shows/updates video because their local stream is being added to the peer connection. However, there might be a race condition.

**Try these fixes in order:**

**Fix 1: Add delay before creating answer (temporary test)**
In `src/pages/Meeting.jsx`, find the `handleOffer` function around line 125 and modify it:

```jsx
const handleOffer = async (data) => {
  console.log('📤 Offer received:', data)
  const { userId: senderId, userName: senderName, offer } = data

  try {
    // Add small delay to ensure local stream is ready
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const answer = await webrtcService.createAnswer(
      senderId,
      offer,
      (candidate) => socketService.sendIceCandidate(code, senderId, candidate),
      (stream) => {
        console.log('Remote stream received with tracks:', stream.getTracks().length)
        setParticipants(prev => {
          const exists = prev.find(p => p.id === senderId)
          if (!exists) {
            return [...prev, {
              id: senderId,
              name: senderName,
              stream,
              isLocal: false
            }]
          }
          return prev
        })
      }
    )
    socketService.sendAnswer(code, senderId, answer)
  } catch (err) {
    console.error('Error creating answer:', err)
  }
}
```

**Fix 2: Ensure local stream exists (permanent solution)**
In `src/pages/Meeting.jsx`, modify the useEffect around line 50:

```jsx
useEffect(() => {
  if (!localStream) {
    console.warn('⚠️ Local stream not ready yet')
    return
  }

  webrtcService.setLocalStream(localStream)
  console.log('✅ WebRTC service has local stream with', localStream.getTracks().length, 'tracks')
  
  // ... rest of code
}, [localStream, ...])
```

**Debug: Check browser console after joining as participant:**

Look for these logs:
```
📡 [LISTEN] Registering listener for: "offer"
📹 Adding 2 tracks for peer [HOST_ID]  ← Should show 2 (audio + video)
   ➕ Adding track: audio
   ➕ Adding track: video
📹 Remote track received from [HOST_ID]: video
```

If you see `⚠️ No local stream available for peer` - that's the problem!

---

## Issue 2: Network IP (10.143.45.156) Not Working

**Problem:** Can't connect on network IP even though localhost works

### Root Cause Options (in order of likelihood):

1. **Firewall blocking ports** - 4000, 5000, 5173
2. **Socket.io can't connect to server**
3. **Browsers can't reach IP on network**

### Solution Steps:

**Step 1: Test Basic Connectivity**

On the server machine, open PowerShell:
```powershell
# Test if all ports are listening
netstat -ano | findstr "4000\|5000\|5173"
```

You should see:
```
TCP    0.0.0.0:4000    LISTENING
TCP    0.0.0.0:5000    LISTENING
TCP    0.0.0.0:5173    LISTENING
```

**Step 2: Test from Client Machine**

On the client machine (the joining user):

Open PowerShell and test:
```powershell
# ping the server IP
ping 10.143.45.156

# test port 5173 (frontend)
Test-NetConnection -ComputerName 10.143.45.156 -Port 5173

# test port 4000 (streaming server)
Test-NetConnection -ComputerName 10.143.45.156 -Port 4000

# test port 5000 (backend)
Test-NetConnection -ComputerName 10.143.45.156 -Port 5000
```

All should show: `TcpTestSucceeded : True`

**Step 3: Open Windows Firewall**

On the server machine:

```powershell
# Run as Administrator
# Allow Node.js through firewall
New-NetFirewallRule -DisplayName "Allow Node.js 4000" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Allow Node.js 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Allow Node.js 5173" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

OR disable firewall temporarily for testing:
```powershell
# WARNING: Only for testing! Enable Windows Defender after testing
Set-NetFirewallProfile -Profile Domain, Public, Private -Enabled $false
```

**Step 4: Configure Client to Use Network IP**

On the CLIENT machine accessing the app:

Instead of visiting `http://localhost:5173`, visit:
```
http://10.143.45.156:5173
```

The socketService will automatically detect this and connect to `http://10.143.45.156:4000`

**Step 5: Check Socket Connection**

Open browser F12 → Console on client

Look for:
```
🔌 Connecting to socket server: http://10.143.45.156:4000
✅ Connected to socket server. Socket ID: abc123xyz
```

If you see:
```
❌ Socket connection error: ...
```

Then check:
1. Is server IP correct?
2. Is firewall allowing port 4000?
3. Are all 3 servers running?

---

## Issue 3: Ngrok HTTPS Setup

**Problem:** Using ngrok to tunnel frontend, but backend and streaming server URLs not resolving

### Root Cause:
Ngrok exposes a single URL (your frontend on port 5173), but:
- Your backend is still on localhost:5000
- Your streaming server is still on localhost:4000
- Client can't reach localhost from ngrok public URL

### Solution 1: Use Ngrok for All Servers (Recommended)

**Step 1: Install Ngrok**
```bash
# Download from https://ngrok.com/download
# Or via chocolatey (if installed)
choco install ngrok
```

**Step 2: Expose All 3 Services**

Terminal 1 (Frontend):
```bash
ngrok http 5173
```
Copy the URL, e.g., `https://abc123-ngrok.com`

Terminal 2 (Backend):
```bash
ngrok http 5000
```
Copy the URL, e.g., `https://def456-ngrok.com`

Terminal 3 (Streaming):
```bash
ngrok http 4000
```
Copy the URL, e.g., `https://ghi789-ngrok.com`

**Step 3: Create `.env` File in Frontend**

Create or edit `frontend/.env`:
```env
VITE_STREAMING_SERVER_URL=https://ghi789-ngrok.com
VITE_BACKEND_URL=https://def456-ngrok.com
```

Replace with YOUR actual ngrok URLs!

**Step 4: Start Frontend Dev Server**
```bash
cd frontend
npm run dev
```

**Step 5: Visit Ngrok URL**
Open: `https://abc123-ngrok.com`

Check browser console:
```
🔌 Using VITE_STREAMING_SERVER_URL from env: https://ghi789-ngrok.com
✅ Connected to socket server. Socket ID: xyz123
```

### Solution 2: Use Localhost But Access via LAN

If you want to access from network without ngrok:

**On Server Machine:**
```bash
# Make sure servers listen on 0.0.0.0 (already done)
npm run dev
```

**On Client Machine:**
Visit: `http://SERVER_IP:5173`

Where `SERVER_IP` is like `10.143.45.156` or `192.168.1.XXX`

Make sure firewall allows those ports (see Issue 2)

---

## Better Testing Procedure

**For Localhost Two Browsers:**
1. Browser 1 (Chrome): `http://localhost:5173` as Host
2. Browser 2 (Firefox): `http://localhost:5173` as Participant
3. F12 console on both
4. Host creates meeting
5. Participant joins
6. Host approves
7. **Watch console for:**
   - `📹 Loading 2 tracks` on both browsers
   - `📹 Remote track` on both browsers
   - Cameras should show in video grid

**For Network IP:**
1. Server machine: Run all 3 servers
2. Client machine: Open browser
3. Visit: `http://10.143.45.156:5173`
4. Test connectivity with browser console
5. Check Windows Firewall rules

**For Ngrok:**
1. Terminal 1-3: ngrok for each service
2. Create `.env` with ngrok URLs
3. Terminal 4: `npm run dev` in frontend
4. Visit: `https://your-ngrok-url.com`
5. Check console for `VITE_STREAMING_SERVER_URL from env`

---

## Checklist for Debugging

- [ ] Browser console shows ✅ socket connected
- [ ] Server console shows socket event logs
- [ ] 📹 tracks are being added on offer
- [ ] 📹 tracks are being added on answer
- [ ] 📹 Remote track received on both sides
- [ ] Firewall allows ports 4000, 5000, 5173
- [ ] All 3 servers are running
- [ ] Network IP is accessible (test with ping)
- [ ] Ngrok URLs are in `.env` file

---

## Quick Commands Reference

```bash
# Check all ports listening
netstat -ano | findstr "4000\|5000\|5173"

# Allow firewall (run as admin)
New-NetFirewallRule -DisplayName "Allow Node 4000" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow

# Start dev servers
npm run dev  # in each folder: frontend, backend, streaming_server

# Ngrok examples
ngrok http 5173
ngrok http 5000
ngrok http 4000

# Get local network IP
ipconfig | findstr "IPv4"
```

---

## Still Having Issues?

1. **Check browser console (F12)**
   - Look for red errors
   - Look for 🔌 socket connection messages
   - Look for 📹 track messages

2. **Check server terminal**
   - Look for 🔵 APPROVE-JOIN messages
   - Look for 📤 Emitting messages
   - Look for ❌ error messages

3. **Capture exact error message**
   - Screenshot browser console
   - Screenshot server terminal
   - Tell exact steps to reproduce

4. **Try basic test first**
   - Two browsers localhost
   - Exact same device (same network)
   - No proxies or VPNs
   - Disable firewall temporarily for testing
