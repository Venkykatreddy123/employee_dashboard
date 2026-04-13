import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://empdashboard.onrender.com';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket'],
    withCredentials: true
});

export const subscribeToUpdates = (callback) => {
    socket.on('DATA_UPDATED', callback);
    socket.on('EMPLOYEE_UPDATED', callback);
};

export const unsubscribeFromUpdates = () => {
    socket.off('DATA_UPDATED');
    socket.off('EMPLOYEE_UPDATED');
};
