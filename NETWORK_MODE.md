# Network Mode Setup Guide

## Overview
MeetLive now supports network access, allowing you to connect from mobile devices, tablets, and other computers on the same network. This guide covers the setup and usage.

## Key Improvements (Latest Update)

### 1. **Dynamic Socket Server Detection**
   - Socket client now automatically detects whether to use localhost or network IP
   - On localhost: Connects to `http://localhost:4000`
   - On network: Connects to `http://{YOUR_IP}:4000`
   - No manual configuration needed!

### 2. **Mobile Responsive UI**
   - Landing page adapts to all screen sizes (phones, tablets, desktops)
   - Meeting page now shows:
     - **Desktop:** Host on right, participants on left sidebar (vertical scroll)
     - **Tablet:** Host on top, participants below (fit screen)
     - **Mobile:** Host on top, participants below (horizontal scroll on small screens)
   - Control buttons resize and adjust spacing for mobile
   - Touch-friendly button sizes

### 3. **Servers Listen on All Interfaces**
   - Frontend: Listens on `0.0.0.0:5173`
   - Backend: Listens on `0.0.0.0:5000`
   - Streaming: Listens on `0.0.0.0:4000`
   - All servers now support network access!

### 4. **CORS Updated**
   - All servers accept cross-origin requests from:
     - Localhost (`http://localhost:*`)
     - Any IP (`*`)
   - Allows mobile devices to connect safely

---

## Setup Instructions

### Option 1: Quick Network Start (Windows)

**Alternative 1a: Use the provided batch script**
```batch
cd c:\Users\brijesh\Desktop\Yudiz\MeetLive
.\start-network.bat
```

**Alternative 1b: Manual start**

Open 3 Command Prompt windows and run:

**Window 1 - Streaming Server:**
```bash
cd c:\Users\brijesh\Desktop\Yudiz\MeetLive\streaming_server
npm run dev
```

**Window 2 - Backend Server:**
```bash
cd c:\Users\brijesh\Desktop\Yudiz\MeetLive\backend
npm run dev
```

**Window 3 - Frontend Server (Network accessible):**
```bash
cd c:\Users\brijesh\Desktop\Yudiz\MeetLive\frontend
npm run dev -- --host
```

### Option 2: Linux/Mac Network Start

```bash
cd ~/path/to/MeetLive

# Terminal 1
cd streaming_server && npm run dev

# Terminal 2
cd backend && npm run dev

# Terminal 3
cd frontend && npm run dev -- --host
```

---

## Finding Your Network IP

### Windows:
```bash
# Method 1: Command Prompt
ipconfig

# Look for "IPv4 Address" under your WiFi adapter
# Example: 192.168.1.100

# Method 2: PowerShell
[System.Net.Dns]::GetHostEntry([System.Net.Dns]::GetHostName()).AddressList | Where-Object {$_.AddressFamily -eq 'InterNetwork'} | Select-Object IPAddressToString
```

### Mac/Linux:
```bash
ifconfig | grep "inet "
# Look for inet address like 192.168.1.100
```

### Quick Check:
When frontend starts with `--host`, console output shows:
```
Local:   http://localhost:5173
Network: http://192.168.1.100:5173  <-- Use this on mobile
```

---

## Usage on Mobile

### Prerequisites:
1. Mobile device on **same WiFi** as development machine
2. Frontend server running with `npm run dev -- --host`
3. All three servers running (Streaming, Backend, Frontend)

### Steps:

**1. Find your computer's IP address** (see section above)

**2. On mobile browser:**
```
Open: http://YOUR_COMPUTER_IP:5173
```

**Example:** If your computer IP is `192.168.1.100`:
```
http://192.168.1.100:5173
```

**3. Enter your name and create/join meeting**
   - Works exactly like desktop version
   - Camera will request permission
   - Full video streaming works over local network

---

## Troubleshooting

### "Can't connect from mobile"

**Issue 1: Wrong IP Address**
- Check your computer IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Make sure you use the **IPv4 address**, not localhost
- Example correct: `http://192.168.x.x:5173`
- Example wrong: `http://localhost:5173` (won't work from mobile)

**Issue 2: Not on Same Network**
- Ensure mobile and computer are connected to same WiFi
- Check WiFi name on mobile matches your network

**Issue 3: Firewall Blocking**
- Windows Firewall may block ports 5173, 5000, 4000
- Allow Node.js through Windows Defender Firewall:
  ```
  Settings > Security > Firewall > Allow an app > Add Node.js (node.exe)
  ```
- Or disable firewall temporarily for testing

**Issue 4: Socket Connection Fails**
- Ensure all 3 servers are running
- Check console for error messages
- Verify streaming server shows: `✅ Streaming server running`
- Verify backend shows: `✅ Backend server running`
- Verify frontend shows: `Local:` and `Network:` URLs

### "Camera not working"
- Grant permission when browser asks
- Check browser console (F12 > Console) for errors
- Ensure camera isn't used by another app

### "Other user can't see me"
- Check your camera indicator (blue button should be on)
- Verify WebRTC connection shows both users in console
- If same laptop used for both users, camera will show single feed (expected)

### "Infinite waiting loop"
- Host must approve join request (yellow button with number)
- Wait a few seconds after clicking approve
- Socket connection may need time to establish
- Check browser console for socket connection logs

---

## Technical Notes

### Socket URL Selection Logic:
```javascript
// Automatically happens - no config needed!
if (running on localhost) {
  connect to: http://localhost:4000
} else {
  connect to: http://{current_domain}:4000
}
```

### Same-Laptop Testing:
- **Issue:** Both browser windows use same camera
- **Solution:** Use different devices (mobile + desktop) or
- **Workaround:** 
  - Browser 1 (Desktop): localhost:5173 (host)
  - Browser 2 (Network IP): 192.168.x.x:5173 (participant)
  - This forces socket reconnection = fixed!

### Performance Tips:
- Use 2.4GHz WiFi for better range
- 5GHz WiFi for better speed (if all devices support it)
- Reduce video resolution if lag occurs
- Close unnecessary browser tabs
- Use Chrome/Edge for best WebRTC support

---

## Development URLs

When running `npm run dev -- --host`:

```
Frontend:   http://localhost:5173        (local development)
            http://192.168.x.x:5173     (network access)

Backend:    http://localhost:5000        (local)
            http://192.168.x.x:5000     (network)

Streaming:  ws://localhost:4000          (local)
            ws://192.168.x.x:4000       (network)
```

---

## Production Deployment Notes

For real-world deployment:
1. Host all servers on a public IP (AWS, Heroku, DigitalOcean, etc.)
2. Use HTTPS/WSS instead of HTTP/WS
3. Update CORS origins to your domain
4. Use environment variables for server URLs
5. See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) (future document)

---

## Quick Reference

| Task | Command |
|------|---------|
| Start all locally | `.\start-dev.bat` |
| Start for network | `.\start-network.bat` |
| Find your IP | `ipconfig` (Windows) / `ifconfig` (Mac) |
| Access locally | `http://localhost:5173` |
| Access remotely | `http://YOUR_IP:5173` |
| View console logs | F12 in browser |
| Check server status | Look for ✅ emoji in terminal |

---

## Questions?

1. Check browser console (F12 > Console tab)
2. Check server terminal for error messages
3. Ensure all 3 servers are running: Streaming, Backend, Frontend
4. Verify you're using correct IP address for network access
5. Try localhost first to eliminate network issues

---

**Version:** 1.0 - Last Updated: Feb 2026
