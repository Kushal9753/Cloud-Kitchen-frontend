const config = {
    // VITE_API_URL must be set in Vercel Environment Variables
    // If not set, it defaults to localhost (which will fail in production)
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',

    // Set VITE_ENABLE_SOCKET=false in Vercel if backend is serverless
    SOCKET_ENABLED: import.meta.env.VITE_ENABLE_SOCKET === 'true',
};

export default config;
