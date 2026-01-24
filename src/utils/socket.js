import { io } from 'socket.io-client';
import config from '../config';

let socket = null;

export const getSocket = () => {
    if (!config.SOCKET_ENABLED) {
        console.warn('Socket.io is disabled in configuration. Real-time features will not work.');
        return null;
    }

    if (!socket) {
        socket = io(config.API_URL, {
            transports: ['websocket', 'polling'], // Try websocket first
            reconnectionAttempts: 5,
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
