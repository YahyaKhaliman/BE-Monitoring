require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const { log } = require('./middleware/log');

const userRoutes = require("./routes/user.route");
const spkRoutes = require("./routes/spkTarget.route")
const manPowerRoutes = require('./routes/manPower.route');
const realisasiRoutes = require('./routes/realisasi.route');
const monitoringJobRoutes = require('./routes/monitoringJob.route');
const laporanRoutes = require('./routes/laporan.route');

const app = express();
app.use(cors());
app.use(express.json());
app.use(log) // DEBUG

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api", userRoutes);
app.use("/api", spkRoutes)
app.use("/api", realisasiRoutes)
app.use("/api", manPowerRoutes)
app.use("/api", monitoringJobRoutes)
app.use("/api", laporanRoutes)

const PORT = process.env.PORT ;
(async () => {
    try {
        await sequelize.authenticate();
        app.listen(PORT, () => console.log(`API running at PORT :${PORT}`));
    } catch (e) {
        console.error("DB error:", e);
        process.exit(1);
    }
})();
