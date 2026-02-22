const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection

const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}

class WebRTCService {
  constructor() {
    this.peers = new Map()
    this.localStream = null
  }

  setLocalStream(stream) {
    this.localStream = stream
  }

  createPeerConnection(peerId, onIceCandidate, onTrack) {
    if (this.peers.has(peerId)) {
      return this.peers.get(peerId)
    }

    const peerConnection = new RTCPeerConnection({ iceServers: iceServers.iceServers })

    // Add local tracks to the connection
    if (this.localStream) {
      console.log(`📹 Adding ${this.localStream.getTracks().length} tracks for peer ${peerId}`)
      this.localStream.getTracks().forEach(track => {
        console.log(`   ➕ Adding track: ${track.kind}`)
        peerConnection.addTrack(track, this.localStream)
      })
    } else {
      console.warn(`⚠️ No local stream available for peer ${peerId}`)
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        onIceCandidate(event.candidate)
      }
    }

    // Handle remote tracks
    peerConnection.ontrack = event => {
      console.log(`📹 Remote track received from ${peerId}: ${event.track.kind}`)
      if (event.streams && event.streams.length > 0) {
        onTrack(event.streams[0])
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerId}: ${peerConnection.connectionState}`)
    }

    this.peers.set(peerId, peerConnection)
    return peerConnection
  }

  async createOffer(peerId, onIceCandidate, onTrack) {
    console.log(`🎬 Creating OFFER for peer ${peerId}`)
    const peerConnection = this.createPeerConnection(peerId, onIceCandidate, onTrack)
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    console.log(`✅ OFFER created for ${peerId}`)
    return offer
  }

  async createAnswer(peerId, offer, onIceCandidate, onTrack) {
    console.log(`🎬 Creating ANSWER for peer ${peerId}`)
    const peerConnection = this.createPeerConnection(peerId, onIceCandidate, onTrack)
    console.log(`   Setting remote description (offer) for ${peerId}`)
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await peerConnection.createAnswer()
    console.log(`   Setting local description (answer) for ${peerId}`)
    await peerConnection.setLocalDescription(answer)
    console.log(`✅ ANSWER created for ${peerId}`)
    return answer
  }

  async addAnswer(peerId, answer) {
    const peerConnection = this.peers.get(peerId)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    }
  }

  async addIceCandidate(peerId, candidate) {
    const peerConnection = this.peers.get(peerId)
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (e) {
        console.error(`Failed to add ICE candidate for ${peerId}:`, e)
      }
    }
  }

  closePeerConnection(peerId) {
    const peerConnection = this.peers.get(peerId)
    if (peerConnection) {
      peerConnection.close()
      this.peers.delete(peerId)
    }
  }

  closeAllConnections() {
    this.peers.forEach((peerConnection) => {
      peerConnection.close()
    })
    this.peers.clear()
  }

  getPeerConnection(peerId) {
    return this.peers.get(peerId)
  }

  getAllPeerConnections() {
    return Array.from(this.peers.values())
  }
}

export default new WebRTCService()
