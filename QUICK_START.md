# MeetLive - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- Modern web browser
- Webcam and microphone

### Step 1: Install Dependencies (2 minutes)

```bash
# Frontend
cd frontend
npm install
cd ..

# Backend
cd backend
npm install
cd ..

# Streaming Server
cd streaming_server
npm install
cd ..
```

### Step 2: Start All Servers

#### Windows Users
```bash
start-dev.bat
```

#### Mac/Linux Users
```bash
bash start-dev.sh
```

#### Manual (All Platforms)

Open 3 terminal windows:

```
Terminal 1: cd streaming_server && npm run dev
Terminal 2: cd backend && npm run dev
Terminal 3: cd frontend && npm run dev
```

### Step 3: Open in Browser

Navigate to: **http://localhost:5173**

You should see the MeetLive landing page! 🎉

## 👥 Test with Two Users

### User 1 (Host)
1. Enter your name (e.g., "Alice")
2. Click **"+ Host a Meeting"**
3. Copy the meeting code (e.g., "ABC123")
4. Your video should appear on the right side

### User 2 (Guest)
1. Open a new browser or private window
2. Go to **http://localhost:5173**
3. Enter your name (e.g., "Bob")
4. Paste the meeting code
5. Click **"Join Meeting"**
6. Wait for approval from Host

### Host Approves Request
1. Click the yellow **"Join Requests"** button with the badge
2. See Bob's request
3. Click **"Approve"** to let Bob join
4. Bob's video appears on the left side

## 🎮 Test Features

### Camera/Microphone Controls
- Click the camera icon to enable/disable your video
- Click the mic icon to enable/disable your audio

### Remove Participant
- Click on any participant's video to remove them (host only)

### End Meeting
- Click the **red button** to leave/end the meeting

### Join Requests Management
- Click the **yellow button** to see and manage requests
- Approve or reject requests as the host

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera not working | Check browser permissions for camera |
| Connection refused | Make sure all 3 servers are running |
| Black video screen | Try refreshing the page |
| No join requests modal | Check if streaming_server is running |

## 📚 Documentation

- **README.md** - Full feature documentation
- **SETUP.md** - Detailed setup instructions
- **IMPLEMENTATION_SUMMARY.md** - Complete architecture details

## 🎯 Key Features to Try

✅ **Host a Meeting** - Create and share meeting codes
✅ **Join Requests** - Approve/reject participants
✅ **Video Streaming** - P2P video with WebRTC
✅ **Camera Toggle** - Control your video
✅ **Mic Toggle** - Control your audio
✅ **Participant Removal** - Remove users (host only)
✅ **Responsive UI** - Works on desktop and mobile
✅ **Smooth Animations** - Beautiful transitions

## 💡 Pro Tips

1. Use **private/incognito mode** for the guest window to avoid conflicts
2. Test with **different browsers** (Chrome, Firefox, Safari)
3. Check **browser console** (F12) for any error messages
4. Ensure **firewall** allows localhost connections
5. Use **modern browsers** for best WebRTC support

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for lint errors
npm run lint
```

## 🚀 Production Build

```bash
cd frontend
npm run build

# Deploy the 'dist' folder to your web server
```

## 📞 Need Help?

1. Check SETUP.md for detailed setup
2. Review IMPLEMENTATION_SUMMARY.md for architecture
3. Check browser console for errors (F12)
4. Verify all 3 servers are running
5. Check that environment variables are set correctly

---

**Happy video calling! 📹**

For more information, see README.md and SETUP.md
