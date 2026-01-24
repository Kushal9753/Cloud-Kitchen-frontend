// Helper to determine API URL dynamically
const getApiUrl = () => {
    // 1. If explicitly set in environment (Vercel/env file), use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // 2. If running on localhost or special local domains, default to local backend
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // If on a LAN IP (e.g., 192.168.x.x), try to connect to backend on same IP
        if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname.match(/^[0-9.]*$/)) {
            return `http://${hostname}:5000`;
        }
    }

    // 3. Fallback for strictly local dev
    return 'http://localhost:5000';
};

const config = {
    // VITE_API_URL must be set in Vercel Environment Variables
    API_URL: getApiUrl(),

    // Set VITE_ENABLE_SOCKET=false in Vercel if backend is serverless
    SOCKET_ENABLED: import.meta.env.VITE_ENABLE_SOCKET === 'true',
};

export default config;
