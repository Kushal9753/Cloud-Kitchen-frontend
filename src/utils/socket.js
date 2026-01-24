import { io } from 'socket.io-client';
import config from '../config';

let socket = null;

export const getSocket = () => {
    // Default to DISABLED on Vercel unless explicitly enabled
    // This prevents "Connection Refused" errors on serverless envs
    if (!config.SOCKET_ENABLED) {
        return null;
    }

    if (!socket) {
        try {
            socket = io(config.API_URL, {
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 3,
                timeout: 5000,
                autoConnect: true
            });
        } catch (error) {
            console.error('Failed to initialize socket:', error);
            return null;
        }

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
