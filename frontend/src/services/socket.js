import { io } from 'socket.io-client';

const getDynamicSocketURL = () => {
  const envURL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
  if (typeof window !== 'undefined' && /android/i.test(navigator.userAgent) && envURL.includes('localhost')) {
     return envURL.replace('localhost', '10.0.2.2');
  }
  return envURL;
};

const token = localStorage.getItem('token');

const socket = io(getDynamicSocketURL(), {
  auth: {
    token: token
  },
  transports: ['websocket'],
  autoConnect: !!token, // Only connect if user is already established
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

console.log(`📡 [SOCKET] Protocol: ${token ? 'AUTHENTICATED' : 'ANONYMOUS'} Gateway: ${getDynamicSocketURL()}`);

export default socket;
