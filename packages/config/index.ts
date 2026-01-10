export const PORTS = {
    GATEWAY: Number(process.env.GATEWAY_PORT),
    AUTH: Number(process.env.AUTH_PORT),
    CATEGORY: Number(process.env.CATEGORY_PORT),
    ORDER: Number(process.env.ORDER_PORT)
};

export const API_URL = `http://localhost:${PORTS.GATEWAY}`;