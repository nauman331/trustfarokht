import { PORTS } from "@raddi/config";

declare const Bun: any;

Bun.serve({
    port: PORTS.GATEWAY,
    async fetch(req: Request) {
        const url = new URL(req.url);

        // Proxy to Auth Service
        if (url.pathname.startsWith("/auth")) {
            const target = req.url.replace(url.host, `localhost:${PORTS.AUTH}`).replace("/auth", "");
            return fetch(target, { method: req.method, body: req.body });
        }

        // Direct client to Order WebSocket
        if (url.pathname === "/orders/connect") {
            return Response.json({ wsUrl: `ws://localhost:${PORTS.ORDERS}` });
        }

        return new Response("RaddiGo Gateway", { status: 200 });
    }
});
console.log(`🚀 Gateway running on http://localhost:${PORTS.GATEWAY}`);