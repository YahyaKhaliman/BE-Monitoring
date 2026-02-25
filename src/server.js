require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const { log } = require("./middleware/log");
const { authenticateToken } = require("./middleware/auth");

const userRoutes = require("./routes/user.route");
const spkRoutes = require("./routes/spkTarget.route");
const manPowerRoutes = require("./routes/manPower.route");
const realisasiRoutes = require("./routes/realisasi.route");
const monitoringJobRoutes = require("./routes/monitoringJob.route");
const laporanRoutes = require("./routes/laporan.route");

const app = express();

function createRateLimiter({
    windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    max = Number(process.env.RATE_LIMIT_MAX || 120),
} = {}) {
    const buckets = new Map();

    return function rateLimiter(req, res, next) {
        const ip = req.ip || req.socket?.remoteAddress || "unknown";
        const now = Date.now();

        let entry = buckets.get(ip);
        if (!entry || now >= entry.resetAt) {
            entry = { count: 0, resetAt: now + windowMs };
        }

        entry.count += 1;
        buckets.set(ip, entry);

        if (entry.count > max) {
            res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
            return res.status(429).json({
                ok: false,
                message: "Terlalu banyak request. Coba lagi nanti.",
            });
        }

        next();
    };
}

const corsOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        // Allow requests with no origin (postman, curl, etc.)
        if (!origin) return callback(null, true);

        if (corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
};
app.use(cors(corsOptions));

const isHttpLogEnabled =
    String(process.env.ENABLE_HTTP_LOG).toLowerCase() === "true";

app.disable("x-powered-by");
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "200kb" }));
if (isHttpLogEnabled) {
    app.use(log);
}
app.use("/api", createRateLimiter());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api", userRoutes);
app.use("/api", authenticateToken);
app.use("/api", spkRoutes);
app.use("/api", realisasiRoutes);
app.use("/api", manPowerRoutes);
app.use("/api", monitoringJobRoutes);
app.use("/api", laporanRoutes);

const PORT = process.env.PORT;
(async () => {
    try {
        await sequelize.authenticate();
        app.listen(PORT, () => console.log(`API running at PORT :${PORT}`));
    } catch (e) {
        console.error("DB error:", e);
        process.exit(1);
    }
})();
