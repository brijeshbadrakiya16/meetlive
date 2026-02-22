# MeetLive - Video Meeting Web Application

A fully functional real-time video meeting web application built with React, Node.js, Express, and WebRTC. This application enables peer-to-peer video communication with a host-based meeting management system.

## Features

- **Landing Page**: Users can host a new meeting or join an existing one using a meeting code
- **Real-time Video Streaming**: Peer-to-peer video streaming using WebRTC
- **Host Controls**: 
  - Approve/Reject join requests from users
  - Remove participants from the meeting
  - End the meeting
  - Enable/Disable camera and microphone
- **Participant Features**:
  - Join meetings with host approval
  - Enable/Disable camera and microphone
  - Leave the meeting
- **Responsive Design**: Beautiful, responsive UI with Tailwind CSS and smooth animations
- **Real-time Communication**: Socket.io for signaling and media negotiation
- **ICE Candidates**: Automatic handling of network interfaces
- **Mobile Friendly**: Fully responsive UI works on phones, tablets, and desktops
- **Network Access**: Access from any device on the same WiFi network

## Getting Started - Quick Commands

### Local Development (Single Machine)
```bash
.\start-dev.bat
# Opens at: http://localhost:5173
```

### Network Mode (Mobile/Other Devices)
```bash
.\start-network.bat
# Opens at: http://YOUR_IP:5173 (see console output)
```

**For detailed network setup guide, see [NETWORK_MODE.md](./NETWORK_MODE.md)**

## Architecture

### Frontend (React + Vite + Tailwind CSS)
- **Pages**: Landing, Meeting
- **Components**: VideoStream, VideoGrid, ControlPanel, JoinRequestsModal
- **Utils**: Socket service, WebRTC service, Custom hooks
- **Context**: Meeting context for global state management

### Backend (Express.js + Node.js)
- REST API endpoints for meeting management
- Meeting creation and tracking
- Participant management

### Streaming Server (Node.js + Socket.io)
- Real-time WebRTC signaling
- Meeting management
- Join request handling
- ICE candidate relay

## Project Structure

```
MeetLive/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   └── Meeting.jsx
│   │   ├── components/
│   │   │   ├── VideoStream.jsx
│   │   │   ├── VideoGrid.jsx
│   │   │   ├── ControlPanel.jsx
│   │   │   └── JoinRequestsModal.jsx
│   │   ├── utils/
│   │   │   ├── socketService.js
│   │   │   └── webrtcService.js
│   │   ├── hooks/
│   │   │   └── useMediaStream.js
│   │   ├── context/
│   │   │   └── MeetingContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── streaming_server/
    ├── stream_server.js
    ├── package.json
    └── .env
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Frontend Setup

```bash
cd frontend
npm install
```

### Backend Setup

```bash
cd backend
npm install
```

### Streaming Server Setup

```bash
cd streaming_server
npm install
```

## Running the Application

### Start Streaming Server (Port 4000)

```bash
cd streaming_server
npm run dev
```

### Start Backend Server (Port 5000)

```bash
cd backend
npm run dev
```

### Start Frontend Development Server (Port 5173)

```bash
cd frontend
npm run dev
```

The application should now be accessible at `http://localhost:5173`

## Usage

### Hosting a Meeting

1. Enter your name on the landing page
2. Click "Host a Meeting" button
3. A meeting code will be generated
4. Share the meeting code with others
5. Wait for users to request to join
6. Approve/Reject join requests in the Join Requests modal
7. Your video will appear on the right side (large rectangle)
8. Other participants' videos will appear on the left side (vertical stack)

### Joining a Meeting

1. Enter your name on the landing page
2. Enter the meeting code provided by the host
3. Click "Join Meeting" button
4. Wait for the host to approve your request
5. Once approved, your video will stream to other participants

### Meeting Controls

- **Camera Toggle**: Enable/disable your camera
- **Microphone Toggle**: Enable/disable your microphone
- **View Requests** (Host only): See and manage join requests
- **Remove Participant** (Host only): Click on a participant to remove them
- **Leave/End Meeting**: Leave the meeting (or end it if you're the host)

## Environment Variables

### Frontend (.env)
```
VITE_STREAMING_SERVER_URL=http://localhost:4000
VITE_BACKEND_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
STREAMING_SERVER_URL=http://localhost:4000
NODE_ENV=development
```

### Streaming Server (.env)
```
PORT=4000
NODE_ENV=development
```

## Technologies Used

- **Frontend**:
  - React 19
  - Vite
  - Tailwind CSS
  - React Router DOM
  - Socket.io Client
  - WebRTC API

- **Backend**:
  - Express.js
  - Node.js
  - CORS
  - Dotenv

- **Streaming Server**:
  - Socket.io
  - Node.js http module
  - CORS

## API Endpoints

### Health Check
- `GET /health` - Check if backend server is running

### Meeting Management
- `POST /api/meetings/create` - Create a new meeting
- `GET /api/meetings/:code` - Get meeting details
- `POST /api/meetings/:code/end` - End a meeting
- `POST /api/meetings/:code/participants` - Update participants
- `GET /api/meetings` - Get all active meetings

## Socket.io Events

### Client to Server
- `host-meeting` - Create a new meeting
- `join-meeting` - Request to join a meeting
- `approve-join` - Approve a join request
- `reject-join` - Reject a join request
- `send-offer` - Send WebRTC offer
- `send-answer` - Send WebRTC answer
- `send-ice-candidate` - Send ICE candidate
- `remove-participant` - Remove a participant
- `leave-meeting` - Leave the meeting
- `end-meeting` - End the meeting

### Server to Client
- `meeting-created` - Meeting successfully created
- `join-request-sent` - Join request sent to host
- `join-approved` - Join request approved
- `join-rejected` - Join request rejected
- `join-request` - Notify host about new join request
- `user-joined` - Notify users about new participant
- `offer` - Receive WebRTC offer
- `answer` - Receive WebRTC answer
- `ice-candidate` - Receive ICE candidate
- `user-left` - Notify when user leaves
- `meeting-ended` - Meeting ended by host
- `participant-removed` - User removed from meeting
- `host-disconnected` - Host disconnected

## Performance Optimization

- WebRTC peer connections are efficiently managed
- Video streams are optimized with appropriate resolution
- Responsive design ensures smooth experience on all devices
- Smooth animations with CSS transitions
- Lazy loading of components

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari (with limitations on some WebRTC features)
- Edge

## Known Limitations

- Currently supports up to reasonable number of participants (tested with 5-10)
- Requires modern browser with WebRTC support
- Screen sharing is not yet implemented
- Recording is not yet implemented

## Future Enhancements

- [ ] Screen sharing functionality
- [ ] Meeting recording
- [ ] Chat functionality
- [ ] Meeting history
- [ ] User authentication
- [ ] Database integration
- [ ] Deployment documentation
- [ ] Performance metrics dashboard

## Troubleshooting

### Camera/Microphone not working
- Check browser permissions for camera and microphone
- Ensure devices are not in use by other applications
- Try restarting the application

### Connection issues
- Ensure all three servers are running
- Check firewall settings
- Verify environment variables are correct
- Check browser console for error messages

### Video not displaying
- Check network connectivity
- Ensure WebRTC peer connection is established
- Check browser console for errors
- Verify that hosts and guests are properly connected

## Security Considerations

- This application is designed for development and demonstration
- For production use, implement:
  - HTTPS/WSS encryption
  - User authentication
  - Server-side validation
  - Rate limiting
  - Input sanitization
  - CORS policy refinement

## License

MIT License

## Support

For issues or feature requests, please create an issue in the repository.

## Author

Created by Brijesh - 2026
