# Debugging Guide - Infinite Loop Issue

## For Users: How to Check What's Happening

### Step 1: Open Browser Console
1. Press `F12` on your keyboard
2. Click the **Console** tab
3. You'll see logs with emojis

### Step 2: Look for These Logs

**When HOST creates meeting:**
```
🔌 Connecting to socket server: http://localhost:4000
✅ Connected to socket server. Socket ID: [xxxxx]
📡 [LISTEN] Registering listener for: "meeting-created"
📡 [LISTEN] Registering listener for: "join-request"
[... more listener registrations ...]
📞 [EMIT] join-meeting...
🏠 [EMIT] host-meeting
```

**When PARTICIPANT joins:**
```
🔌 Connecting to socket server: http://localhost:4000
✅ Connected to socket server. Socket ID: [yyyyy]
📡 [LISTEN] Registering listener for: "join-approved"
[... more listener registrations ...]
📞 [EMIT] join-meeting with userId and meeting code
```

**When HOST approves (IMPORTANT):**
```
On HOST browser:
✅ [EMIT] approve-join

On SERVER terminal (should see):
🔵 APPROVE-JOIN received - Code: ABC123, User: user123
🔍 Looking for socket yyyyy - Found: true
✅ Adding socket yyyyy to room meeting-ABC123
📤 Emitting join-approved to socket yyyyy
📢 Broadcasting user-joined to room meeting-ABC123
✅✅✅ user123 successfully approved

On PARTICIPANT browser (should see):
📨 [RECEIVED] join-approved {success: true, meetingCode: "ABC123"}
✅✅✅ JOIN APPROVED - Setting isConnecting to FALSE: {...}
```

**If you see `join-approved` event received, the waiting loop should END!**

---

## Troubleshooting Steps

### Issue 1: Participant still stuck after approval

**Check these in console:**

1. **Does participant see `📨 [RECEIVED] join-approved`?**
   - ✅ YES → Issue is with video, not connection
   - ❌ NO → Event not received (see Issue 2)

2. **Does server log show the approval?**
   - ✅ YES → Event reached server
   - ❌ NO → Event not being sent from host (check browser)

### Issue 2: Server doesn't receive approve-join

**Check on HOST browser console:**
- Do you see `✅ [EMIT] approve-join`?
  - ❌ NO → Button click not registered
  - ✅ YES → See Issue 3

### Issue 3: Event reaches server but participant doesn't get it

**Check server logs:**
- Do you see `🔍 Looking for socket yyyyy - Found: true`?
  - ❌ NO (Found: false) → Participant socket not found!
    - Restart all servers
    - Ensure both on same socket server
  - ✅ YES → See Issue 4

### Issue 4: Event sent but participant not receiving

**In participant browser console, should see:**
```
📨 [RECEIVED] join-approved
```

If NOT showing:
- Check if socket got disconnected (look for `⚠️ Socket disconnected`)
- Check for network errors (look for `❌ Socket connection error`)
- Refresh page and try again

---

## Complete Test Scenarios

### Scenario 1: Two Browsers on Localhost

**Terminal 1:**
```bash
cd streaming_server && npm run dev
```
Watch for: `✅ Streaming server running`

**Terminal 2:**
```bash
cd backend && npm run dev
```
Watch for: `✅ Backend server running`

**Terminal 3:**
```bash
cd frontend && npm run dev
```
Watch for: `Local: http://localhost:5173`

**Browser 1 (Host):**
- Open: http://localhost:5173
- F12 → Console
- Enter name, click "+ Host a Meeting"
- Copy meeting code (e.g., ABC123)
- **Wait for all green logs**

**Browser 2 (Participant):**
- Open: http://localhost:5173 (NEW WINDOW IMPORTANT!)
- F12 → Console
- Enter name (different from Browser 1)
- Paste meeting code
- Click "Join Meeting"
- **Check console - should say "Waiting for host approval..."**

**Back in Browser 1 (Host):**
- **Yellow button should show "1"** (1 join request)
- Click the yellow button
- Click "Approve" in the modal

**In Browser 2 console:**
- **Should see `📨 [RECEIVED] join-approved`**
- **Should see `✅✅✅ JOIN APPROVED`**
- **Waiting screen should disappear - done!**

If participant still stuck:
1. Check server console for logs
2. Check both browser consoles
3. Compare socket IDs in logs
4. Report the exact log output

---

## What Each Emoji Means

| Emoji | Meaning |
|-------|---------|
| 🔌 | Socket connection action |
| ✅ | Success / Event received |
| ❌ | Error / Failed |
| 📡 | Listener registered |
| 📨 | Event received |
| 📤 | Event sent |
| 📢 | Broadcast to multiple |
| 🏠 | Host action |
| 📞 | Join meeting action |
| 🔍 | Looking for something |
| ⚠️ | Warning |
| 🟠 | Server receive (special debug) |
| 🔵 | Server processing (special debug) |

---

## Advanced Debugging

### Check Socket IDs Match

On SERVER logs when participant joins:
```
🟠 JOIN-MEETING received
   ...
   📤 Emitting join-request to host
```

Then when host approves, should see:
```
🔵 APPROVE-JOIN received
   🔍 Looking for socket [SAME_ID_NUMBER] - Found: true
```

If socket IDs don't match = big problem = restart servers!

### Enable Full Network Logging

In browser **DevTools → Network** tab:
- Filter by "WS" (WebSocket)
- You should see connection to socket server
- Should stay "101 Switching Protocols" (connected)
- If shows "error" or "failed" = connection issue

### Check if Both Using Same Socket Server

**Host browser** F12 console, first log:
```
🔌 Connecting to socket server: http://localhost:4000
```

**Participant browser** F12 console, first log:
```
🔌 Connecting to socket server: http://localhost:4000
```

Should be **EXACTLY THE SAME** URL!

If different URLs = won't communicate = restart participant browser

---

## When Creating GitHub Issue

**Include:**
1. Screenshot of HOST browser console (after creating meeting)
2. Screenshot of PARTICIPANT browser console (after joining and clicking approve)
3. Output from SERVER terminal (all 3 servers)
4. What you expect vs what actually happened

**Exact steps to reproduce:**
1. Created meeting with code ABC123
2. Joined from 2nd browser with code ABC123
3. Clicked approve button - yellow button shows "1"
4. After approval, participant still shows "Waiting for host approval"

**Error message (if any):**
- Exact error from console
- Screenshot of red error

---

## Quick Fixes to Try

1. **Refresh both browsers** - sometimes socket gets confused
   - F5 on both browsers
   - Try again

2. **Clear browser cache**
   - Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear all
   - Refresh

3. **Restart all servers**
   - Kill all terminals (Ctrl+C)
   - Restart all 3 servers fresh

4. **Different browsers**
   - Try Chrome + Firefox instead of 2x Chrome
   - Rule out browser-specific issues

5. **Check firewall**
   - On Windows, allow Node.js through firewall
   - Settings → Security → Firewall → Allow app
   - Add node.exe

6. **Delete node_modules and reinstall**
   ```bash
   cd frontend && rm -r node_modules && npm install
   cd ../backend && rm -r node_modules && npm install
   cd ../streaming_server && rm -r node_modules && npm install
   ```

---

## Still Stuck?

Run this command on streaming_server terminal to see all connected sockets:

```javascript
console.log(io.sockets.sockets.size, 'sockets connected')
io.sockets.sockets.forEach(s => {
  console.log(`Socket ${s.id} - Room: ${Array.from(s.rooms)}`)
})
```

Should show:
- 2 sockets connected (host + participant)
- Host in room: `meeting-ABC123`
- Participant in room: `meeting-ABC123`

If not - that's the problem!

---

**Last Updated: Feb 2026**
