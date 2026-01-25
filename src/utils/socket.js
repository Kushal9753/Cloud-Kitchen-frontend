import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
    if (!socket) {
        try {
            socket = io(import.meta.env.VITE_API_ABSOLUTE_URL, {
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
