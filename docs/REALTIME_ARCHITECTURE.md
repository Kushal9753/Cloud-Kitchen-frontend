# Real-Time Architecture Guide

This application uses [Socket.io](https://socket.io/) for real-time features such as:
- Order status updates
- Admin notifications
- Live dashboard statistics

## Configuration

The Socket.io client configuration is centralized in `src/config.js` and `src/utils/socket.js`.

### Environment Variables

To configure the connection for production, set the following environment variables:

- `VITE_API_URL`: The full URL of your backend API (e.g., `https://api.yourdomain.com`). The socket connection will use this URL by default.
- `VITE_ENABLE_SOCKET`: Set to `true` to enable real-time features. Set to `false` to disable them (useful for testing or restricted environments).

### Connection Logic

The socket connection is established in `src/utils/socket.js` (or initialized in components like `authSlice.js` using `io(config.API_URL)`).

We utilize a loose-coupling approach:
1. **Connection**: The client attempts to connect to `config.API_URL`.
2. **Events**: Components listen for specific events (e.g., `orderUpdated`, `newOrder`).
3. **Resilience**: If the connection fails, the application continues to function using standard REST API polling or manual refreshes, although real-time updates will be paused.

## Production Considerations

### Deployment Platforms

**VPS / Dedicated Server (DigitalOcean, EC2, Railway, Render)**
- Works out of the box.
- Ensure your load balancer supports **Sticky Sessions** (Session Affinity) if you run multiple instances of the backend. Socket.io requires sticky sessions to maintain the handshake.

**Serverless (Vercel, AWS Lambda, Netlify Functions)**
- **Warning**: Standard Socket.io does NOT work well with serverless functions because they are stateless and ephemeral.
- If you deploy the *frontend* to Vercel but the *backend* to a VPS/Render, it works fine.
- If you deploy the *backend* as serverless functions, you cannot maintain persistent socket connections. In that case, consider using a hosted service like **Pusher**, **Ably**, or **Liveblocks**, or a separate specialized request handling server.

### Scaling

To scale horizontally (multiple backend nodes):
1. Use a **Redis Adapter** for Socket.io on the backend to propagate events across nodes.
2. Configure your Load Balancer (Nginx, AWS ELB, etc.) to use **Sticky Sessions** based on IP or Cookie.

## Troubleshooting

- **CORS Errors**: Ensure your backend `socket.io` server is configured to accept the frontend's origin.
- **Connection Refused**: Check if `VITE_API_URL` is correct and accessible from the client's network.
- **WebSocket Fails**: Check if your proxy/firewall allows `Upgrade: websocket` headers.
