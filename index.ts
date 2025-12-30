import { AuthRoutes } from "./src/routes/auth.route";
import { CategoryRoutes } from "./src/routes/category.route";
import { adminServiceRoutes } from "./src/routes/adminservice.route"
import { connectDB } from "./src/config/sqldb";
import { connectRedis } from "./src/config/redis";
import { initializeSocket, getSocketHandler } from "./src/config/socket";
import { setupAllSocketControllers } from "./src/socketControllers/index";


await connectDB();
await connectRedis();
console.log("Database migrations completed");

const server = Bun.serve({
  port: Number(process.env.PORT),

  async fetch(req, server) {
    const url = new URL(req.url);

    // Handle Socket.IO requests
    if (url.pathname.startsWith("/socket.io/")) {
      const socketHandler = getSocketHandler();
      if (socketHandler) {
        return socketHandler(req, server);
      }
    }

    // Handle regular HTTP routes
    const routes: any = {
      ...AuthRoutes,
      ...CategoryRoutes,
      ...adminServiceRoutes,
    };

    const route = routes[url.pathname];
    if (route && route[req.method]) {
      return route[req.method](req);
    }

    return new Response("Not Found", { status: 404 });
  },

  websocket: {
    open(ws) {
      console.log("WebSocket opened");
    },
    message(ws, message) {
      // Socket.IO handles its own messages
    },
    close(ws) {
      console.log("WebSocket closed");
    },
  },
});

initializeSocket(server);

setupAllSocketControllers();

console.log(`Server running on port ${server.port}`);