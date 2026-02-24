const monitoringJobModel = require("../models/monitoringJob.model");

async function getLini(req, res) {
    const { cab, lini } = req.query;

    if (!cab) {
        return res.status(400).json({
            ok: false,
            message: "cab wajib diisi",
        });
    }

    try {
        const data = await monitoringJobModel.getLiniByCab({
            cab,
            lini: lini || "JAHIT",
        });
        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

async function getKelompok(req, res) {
    const { cab, lini, kelompok } = req.query;

    if (!cab || !lini) {
        return res.status(400).json({
            ok: false,
            message: "cab dan lini wajib diisi",
        });
    }

    try {
        const data = await monitoringJobModel.getKelompokByCabLini({
            cab,
            lini,
            kelompok,
        });
        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

async function monitoringPerJam(req, res) {
    const { cab, tanggal, lini, kelompok } = req.query;

    if (!cab || !tanggal || !lini || !kelompok) {
        return res.status(400).json({
            ok: false,
            message: "cab, tanggal, lini, kelompok wajib diisi",
        });
    }

    try {
        const rows = await monitoringJobModel.getMonitoringPerJam({
            cab,
            tanggal,
            lini,
            kelompok,
        });
        const persen = await monitoringJobModel.getMonitoringAvgPersen({
            cab,
            tanggal,
            lini,
            kelompok,
        });

        res.json({
            ok: true,
            persen: persen,
            data: rows,
        });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

async function monitoringDetail(req, res) {
    const { cab, tanggal, lini, kelompok } = req.query;

    if (!cab || !tanggal || !lini || !kelompok) {
        return res.status(400).json({
            ok: false,
            message: "cab, tanggal, lini, kelompok wajib diisi",
        });
    }

    try {
        const data = await monitoringJobModel.getMonitoringDetail({
            cab,
            tanggal,
            lini,
            kelompok,
        });

        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

module.exports = {
    getLini,
    getKelompok,
    monitoringPerJam,
    monitoringDetail,
};
