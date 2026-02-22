# Quick Testing Guide - MeetLive

## ⚡ 30-Second Quick Start

### Step 1: Open 3 Command Prompt/Terminal Windows

### Step 2: Start Servers

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

**Window 3 - Frontend Server:**
```bash
cd c:\Users\brijesh\Desktop\Yudiz\MeetLive\frontend
npm run dev -- --host
```

### Step 3: Wait for Startup
Look for these messages:
```
✅ Streaming server running
✅ Backend server running
✅ Frontend ready
```

---

## 🧪 Test Scenario #1: Single Device (Host Only)

1. Open browser → `http://localhost:5173`
2. Enter your name → Click "Host a Meeting"
3. **Expected:** You see your video on the right side
4. **Test Camera:** Click camera button → button turns red → button turns blue again
5. **Test Mic:** Click mic button → button turns red → button turns blue again
6. **Success:** Everything works!

---

## 🧪 Test Scenario #2: Host + Participant (Same Device)

### Setup:
- **Browser 1:** `http://localhost:5173` (Host)
- **Browser 2:** `http://localhost:5173` (Participant in new tab)

### Host (Browser 1):
1. Enter name: "Alice"
2. Click "Host a Meeting"
3. Copy the meeting code (e.g., "ABC123")
4. Share code with participant

### Participant (Browser 2):
1. Enter name: "Bob"
2. Past meeting code in "Meeting Code" field
3. Click "Join Meeting"
4. **Expected:** Yellow button shows "1" (1 join request)

### Host (Back to Browser 1):
1. Click yellow button
2. Modal appears with "Bob" join request
3. Click "Approve"
4. **Expected:** Bob's video appears in left sidebar

### Verify:
- ✅ Both see each other's video
- ✅ Bob can toggle camera/mic
- ✅ Host can remove Bob or end meeting

---

## 🧪 Test Scenario #3: Desktop Host + Mobile Participant

### Prerequisites:
1. Desktop and mobile on same WiFi
2. All 3 servers running with `--host` flag
3. Know your computer's IP address

### Get Computer IP (Windows):
```bash
ipconfig
```
Look for: `IPv4 Address: 192.168.x.x`

### Desktop (Host):
1. Open: `http://localhost:5173`
2. Create meeting
3. Share the meeting code

### Mobile (Participant):
1. Connect to same WiFi
2. Open: `http://192.168.1.100:5173` (use YOUR IP from step above)
3. Enter name and meeting code
4. Wait for host approval

### Desktop (Host):
1. Click yellow button → approve join request

### Verify Mobile:
- ✅ Video appears immediately
- ✅ Can toggle camera (permission request shows)
- ✅ Can hear host's audio
- ✅ UI adapts to mobile screen
- ✅ Controls are touch-friendly

---

## 🧪 Test Scenario #4: Two Browsers on Same Machine (Network Mode)

This tests the infinite loop fix:

### Browser 1 (Localhost):
```
http://localhost:5173
Name: "Alice (Host)"
Click: Host a Meeting
Copy: Meeting Code
```

### Browser 2 (Network IP):
```
http://192.168.1.100:5173  (use YOUR IP)
Name: "Bob (Network)"
Meeting Code: [paste code]
Click: Join Meeting
```

### Host (Browser 1):
```
Yellow button shows "1"
Click approve
⏱ Measure time before Bob appears...
```

### Expected Result:
- Bob's video should appear in 1-2 seconds
- ✅ NO infinite "Waiting for approval..." screen!

---

## 📋 Troubleshooting Checklist

### "I don't see my video as host"
- [ ] Granted camera permission
- [ ] Browser is not blocking camera (check browser settings)
- [ ] Check console (F12) for errors
- [ ] Try Chrome instead of Safari

### "Camera/Mic buttons don't work"
- [ ] Refresh page (F5)
- [ ] Check F12 console for errors
- [ ] Ensure you granted camera permission

### "Join request approval stuck in waiting loop"
- [ ] Check if host clicked approve button
- [ ] Look at host's browser - yellow button should show request count
- [ ] Check WebRTC console logs (F12)
- [ ] Try refreshing both browsers

### "Can't connect from mobile"
- [ ] Use correct IP address (not localhost)
- [ ] Mobile on same WiFi as computer
- [ ] Check computer IP: `ipconfig`
- [ ] Try: `http://192.168.x.x:5173` (with YOUR IP)
- [ ] Check Windows Firewall allows Node.js

### "Can't find local IP"
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep "inet "
```

---

## 🐛 Debug Mode: Check Server Logs

### Terminal 1 (Streaming):
Look for:
```
✅ Streaming server running on 0.0.0.0:4000
🔌 User connected: [socket-id]
✅ [userId] approved to join
```

### Terminal 2 (Backend):
Look for:
```
✅ Backend server running on 0.0.0.0:5000
GET /api/meetings/:code 200
POST /api/meetings/:code/end 200
```

### Terminal 3 (Frontend):
Look for:
```
✅ Frontend ready at:
Local: http://localhost:5173
Network: http://192.168.x.x:5173
```

### Browser Console (F12):
Look for:
```
🔌 Connecting to socket server: http://192.168.1.100:4000
✅ Connected to socket server
📥 Join request sent
✅ Join approved
👤 User joined: [userId]
```

---

## ✅ Success Checklist

When all these work, you're done! ✨

- [ ] See your own video as host
- [ ] Camera button toggles (blue/red)
- [ ] Mic button toggles (blue/red)
- [ ] Participant can join
- [ ] Host approves join request
- [ ] Participant appears in video grid
- [ ] Can see participant's video
- [ ] Participant can toggle camera/mic
- [ ] Host can remove participant
- [ ] Anyone can end meeting
- [ ] Works on mobile device
- [ ] UI responsive on all screen sizes
- [ ] No infinite waiting loop

---

## 🚀 Performance Check

| Metric | Expected |
|--------|----------|
| Video stream lag | <500ms |
| Join approval time | <2 seconds |
| UI responsiveness | Instant |
| Mobile video quality | Auto-adjusts |
| Multiple participants | All sync'd |

---

## 📞 Still Having Issues?

1. **Check [NETWORK_MODE.md](./NETWORK_MODE.md)** - Comprehensive troubleshooting
2. **Check [LATEST_FIXES.md](./LATEST_FIXES.md)** - What was recently fixed
3. **Check Browser Console** - Paste error messages here to debug
4. **Check Server Terminals** - Look for error logs
5. **Try localhost first** - Eliminate network issues

---

**Good luck testing!** 🎉

Feel free to report any issues or improvements needed!
