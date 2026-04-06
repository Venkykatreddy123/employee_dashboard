import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
const token = localStorage.getItem('token');

/**
 * 📡 Socket Gateway: Real-Time Sync Provider
 * Standardizes WebSocket transport and persistent auth handshake.
 */
const socket = io(SOCKET_URL, {
  auth: {
    token: token
  },
  transports: ['websocket'],
  autoConnect: !!token, // Only connect if user is already established
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

console.log(`📡 [SOCKET] Protocol: ${token ? 'AUTHENTICATED' : 'ANONYMOUS'} Gateway: ${SOCKET_URL}`);

export default socket;
