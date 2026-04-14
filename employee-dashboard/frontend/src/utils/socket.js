import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

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
