import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import { createProxyServer } from "httpxy";

const app = express();

app.use(morgan("combined"));

app.get("/api/status/healthz", (req, res) => {
    res.json({ status: "healthy" });
});

app.get("/api/status/readyz", (req, res) => {
    res.json({ status: "ready" });
});

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}`;

    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
        });
    }

    return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:3000`;

    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
        });
    }

    return agentProxies[sandboxId];
}

// WebSocket proxy
const wsProxy = createProxyServer({
    changeOrigin: true,
});

wsProxy.on("error", (err, req, socket) => {
    console.error("WS proxy error:", err.message);
    socket?.destroy();
});

// Normal HTTP requests
app.use((req, res, next) => {
    const host = req.headers.host;

    if (!host) {
        return next();
    }

    const parts = host.split(".");
    const sandboxId = parts[0];
    const type = parts[1];

    if (type === "agent") {
        return getAgentProxy(sandboxId)(req, res, next);
    }

    if (type === "preview") {
        return getProxy(sandboxId)(req, res, next);
    }

    return next();
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket upgrade handling
server.on("upgrade", (req, socket, head) => {
    const host = req.headers.host;

    if (!host) {
        socket.destroy();
        return;
    }

    socket.on("error", () => socket.destroy());

    const parts = host.split(".");
    const sandboxId = parts[0];
    const type = parts[1];

    console.log(
        `WS upgrade request: ${host}, sandboxId: ${sandboxId}, type: ${type}`
    );

    if (type === "agent") {
        wsProxy
            .ws(
                req,
                socket,
                {
                    target: `http://sandbox-service-${sandboxId}:3000`,
                },
                head
            )
            .catch(() => socket.destroy());
    } else if (type === "preview") {
        wsProxy
            .ws(
                req,
                socket,
                {
                    target: `http://sandbox-service-${sandboxId}`,
                },
                head
            )
            .catch(() => socket.destroy());
    } else {
        socket.destroy();
    }
});

export default server;