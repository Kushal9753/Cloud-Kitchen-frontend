const config = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    SOCKET_ENABLED: import.meta.env.VITE_ENABLE_SOCKET === 'true',
};

export default config;
