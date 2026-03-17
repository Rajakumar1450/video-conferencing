live demo:https://video-conferencing-yu8u.onrender.com/

# QuickMeet - WebRTC Video & Chat Application 🚀

A robust, real-time 1-to-1 peer-to-peer video calling and text chatting web application built entirely from scratch. This project demonstrates how to establish direct browser-to-browser communication for high-quality media streaming and ultra-low latency data transfer using pure WebRTC.

## 💻 Tech Stack

**Frontend:**
* HTML5 & CSS3 (Custom UI with Flexbox/Grid, Glassmorphism elements)
* Vanilla JavaScript (ES6+)
* WebRTC API (`RTCPeerConnection`, `RTCDataChannel`, `getUserMedia`)

**Backend (Signaling Server):**
* Node.js
* Express.js
* WebSockets (for real-time signaling and SDP/ICE candidate exchange)

## ✨ Features

### 🎥 Media Streaming (Audio & Video)
* **Real-time Video Calling:** High-quality, auto-scaling video containers (`object-fit: cover`) for a seamless viewing experience.
* **Acoustic Echo Cancellation:** Built-in echo cancellation, auto-gain control, and noise suppression for crystal clear audio.
* **True Hardware Toggling:** "Turn Off Camera" completely releases the hardware track, turning off the webcam light for true privacy.
* **Mute/Unmute Mic:** Easily toggle the local audio stream on the fly.

### 💬 Real-Time Chat (Data Channels)
* **Ultra-low Latency Text Chat:** Powered by WebRTC's `RTCDataChannel`, completely bypassing the server once the P2P connection is established.
* **Modern UI Bubbles:** iMessage/WhatsApp inspired chat interface with distinct local and remote message styling.

### 🛠️ Connection & Reliability
* **NAT Traversal:** Configured with Google's STUN servers to work seamlessly over the internet.
* **Accidental Refresh Protection:** Browser warnings (`beforeunload`) to prevent users from accidentally dropping the call.
* **Room-based Architecture:** Secure channel creation and joining mechanism using unique room names managed via WebSockets.

## 🏗️ Architecture & How It Works

This application utilizes a custom built WebSocket Signaling Server (Node.js) to exchange initial connection data, and the WebRTC API for the actual Peer-to-Peer media and data streams.



1. **Signaling:** Peer A creates a room via WebSocket. Peer B joins. They securely exchange SDP (Session Description Protocol) Offers and Answers through the Node.js server.
2. **ICE Candidates:** Both peers gather their public IP addresses using STUN servers and exchange these candidates via the WebSocket.
3. **P2P Connection:** Once the connection is successfully negotiated, the Node.js server is bypassed. Video, Audio, and Text flow directly between Peer A and Peer B.

## 🚀 How to Run Locally

1. **Clone the repository:**
   git clone https://github.com/yourusername/your-repo-name.git
