# MeetLive Setup Guide

This guide will help you set up and run the MeetLive application.

## Prerequisites

- Node.js v16+ installed
- npm or yarn package manager
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Webcam and microphone for video calls

## Setup Steps

### 1. Install Dependencies

This step installs all required packages for all three components.

**Using PowerShell (Windows):**
```powershell
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

**Using Bash (Mac/Linux):**
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

### 2. Running the Application

You need to open **3 terminal windows** (or tabs) to run all servers simultaneously.

#### Terminal 1: Streaming Server (Port 4000)

```bash
cd streaming_server
npm run dev
```

Expected output:
```
✅ Streaming server running on http://localhost:4000
📡 WebSocket endpoint: ws://localhost:4000
```

#### Terminal 2: Backend Server (Port 5000)

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Backend server running on http://localhost:5000
```

#### Terminal 3: Frontend Development Server (Port 5173)

```bash
cd frontend
npm run dev
```

You should see Vite output with a local URL.

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the MeetLive landing page.

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `dist` folder.

### Backend Deployment

To run in production:

```bash
cd backend
export NODE_ENV=production
npm start
```

### Streaming Server Deployment

```bash
cd streaming_server
export NODE_ENV=production
npm start
```

## Troubleshooting

### Port Already in Use

If you get "port is already in use" error:

**Windows (PowerShell):**
```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 4000
# Kill the process
Stop-Process -Id <PID> -Force
```

**Mac/Linux:**
```bash
# Find process using port
lsof -i :4000
# Kill the process
kill -9 <PID>
```

### WebRTC Connection Issues

1. Check firewall settings
2. Ensure STUN servers are accessible
3. Check browser console for detailed errors
4. Try using different network

### Camera/Microphone Permission Denied

- Check browser permissions for camera and microphone
- Allow permissions when prompted
- Ensure devices are not in use by other applications

### Socket Connection Failed

1. Ensure streaming_server is running on port 4000
2. Check firewall allows WebSocket connections
3. Verify CORS settings in stream_server.js
4. Check browser console for connection errors

## Development Tips

### Enable Verbose Logging

Edit the respective server files to add console.log statements:

```javascript
// In stream_server.js
console.log('Socket event:', event, data)
console.log('Participants:', meeting.participants)
```

### Testing with Multiple Users

1. Open two browser windows
2. First window: Host a meeting
3. Second window: Join with the meeting code
4. Test camera/microphone controls
5. Test approve/reject requests

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Black video screen | Check camera permissions, try refreshing |
| No audio | Check microphone permissions, ensure speakers are on |
| Connection timeout | Ensure all 3 servers are running |
| Join request not appearing | Refresh the page or check console for errors |

## Environment Variables

### Edit .env files if needed:

**frontend/.env:**
```
VITE_STREAMING_SERVER_URL=http://localhost:4000
VITE_BACKEND_URL=http://localhost:5000
```

**backend/.env:**
```
PORT=5000
STREAMING_SERVER_URL=http://localhost:4000
NODE_ENV=development
```

**streaming_server/.env:**
```
PORT=4000
NODE_ENV=development
```

## Next Steps

- [ ] Customize the UI/colors in tailwind.config.js
- [ ] Add database integration
- [ ] Implement user authentication
- [ ] Deploy to a server
- [ ] Add screen sharing
- [ ] Add chat functionality
- [ ] Add meeting recording

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Check server terminal output for clues
4. Verify all environment variables are correct
5. Ensure all dependencies are installed

## Additional Resources

- [WebRTC Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Socket.io Documentation](https://socket.io/docs/)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev)
