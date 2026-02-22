# Quick Setup - Network IP (LAN)

## Use Case
You want to access MeetLive from another device on your local network (same WiFi/LAN).

## Prerequisites
- All 3 servers running: `npm run dev` in each folder
- Firewall allows ports: 4000, 5000, 5173 (see below)

## Get Your Server IP

**Windows:**
```powershell
ipconfig | findstr "IPv4"
```

Look for line like:
```
IPv4 Address. . . . . . . . . . : 10.143.45.156
```

Use `10.143.45.156` as your server IP.

## On Server Machine

**Terminal 1:**
```bash
cd streaming_server
npm run dev
```

**Terminal 2:**
```bash
cd backend
npm run dev
```

**Terminal 3:**
```bash
cd frontend
npm run dev
```

Should see:
```
✅ Streaming server running on http://0.0.0.0:4000
✅ Backend server running on http://0.0.0.0:5000
✅ Frontend available at http://localhost:5173
```

## Allow Windows Firewall

**Run PowerShell as Administrator:**

```powershell
# Allow ports through Windows Defender Firewall
New-NetFirewallRule -DisplayName "Node 4000 (Streaming)" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node 5000 (Backend)" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node 5173 (Frontend)" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

**OR disable firewall temporarily (for testing only):**
```powershell
Set-NetFirewallProfile -Profile Domain, Public, Private -Enabled $false

# Re-enable after testing:
Set-NetFirewallProfile -Profile Domain, Public, Private -Enabled $true
```

## On Client Machine (Different Device)

**Open browser:**
```
http://10.143.45.156:5173
```

Replace `10.143.45.156` with your server IP from step 1.

**Open F12 Console:**

Look for:
```
🔌 Connecting to socket server: http://10.143.45.156:4000
✅ Connected to socket server. Socket ID: ...
```

If you see ❌ error, firewall is probably blocking port 4000.

## Test Connectivity

**From client machine, open PowerShell:**

```powershell
# Test if you can reach server
ping 10.143.45.156

# Test if ports are open
Test-NetConnection -ComputerName 10.143.45.156 -Port 5173
Test-NetConnection -ComputerName 10.143.45.156 -Port 4000
Test-NetConnection -ComputerName 10.143.45.156 -Port 5000
```

All should show: `TcpTestSucceeded : True`

## Troubleshooting

### "Can't connect" / Page won't load

1. Check firewall allows port 5173
2. Check IP is correct (`ipconfig` on server)
3. Both devices on same network?
4. Try: `ping 10.143.45.156`

### Socket connect fails (❌ in console)

1. Check firewall allows port 4000
2. Check streaming server is running
3. Check `http://10.143.45.156:4000` is accessible

### Camera won't show

See: `SETUP_GUIDE.md` → Issue 1

---

## Quick Commands

```bash
# Get server IP
ipconfig | findstr "IPv4"

# Check ports listening
netstat -ano | findstr "4000\|5000\|5173"

# Disable firewall (admin required)
Set-NetFirewallProfile -Profile Domain, Public, Private -Enabled $false

# Enable firewall
Set-NetFirewallProfile -Profile Domain, Public, Private -Enabled $true
```

