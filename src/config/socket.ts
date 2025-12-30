import { Server } from "socket.io";
import { createServer } from "http";

let io: Server | null = null;
let httpServer: any = null;

export const initializeSocket = (bunServer: any) => {
    // Create a Node.js HTTP server for Socket.IO
    httpServer = createServer();

    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || "*",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ["websocket", "polling"],
        allowUpgrades: true,
        upgradeTimeout: 10000,
        pingTimeout: 60000,
        pingInterval: 25000,
        maxHttpBufferSize: 1e6,
        perMessageDeflate: false,
        httpCompression: false,
        connectTimeout: 45000,
        path: "/socket.io/",
    });

    console.log(`Socket.IO initialized on port ${bunServer.port}`);
    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.IO not initialized. Call initializeSocket first.");
    }
    return io;
};

export const getSocketHandler = () => {
    if (!httpServer || !io) {
        return null;
    }

    return async (req: Request, server: any) => {
        // Upgrade WebSocket connections
        if (req.headers.get("upgrade") === "websocket") {
            const success = server.upgrade(req, {
                data: { httpServer }
            });

            if (success) {
                return undefined;
            }
        }

        // Handle Socket.IO polling requests
        return new Promise((resolve) => {
            const nodeReq: any = {
                method: req.method,
                url: new URL(req.url).pathname + new URL(req.url).search,
                headers: Object.fromEntries(req.headers.entries()),
            };

            const nodeRes: any = {
                statusCode: 200,
                headers: {},
                setHeader(key: string, value: string) {
                    this.headers[key] = value;
                },
                writeHead(code: number, headers?: any) {
                    this.statusCode = code;
                    if (headers) {
                        Object.assign(this.headers, headers);
                    }
                },
                end(data?: any) {
                    resolve(new Response(data, {
                        status: this.statusCode,
                        headers: this.headers
                    }));
                },
                write(chunk: any) {
                    // Handle chunked responses
                }
            };

            httpServer.emit('request', nodeReq, nodeRes);
        });
    };
};
