const monitoringJobModel = require("../models/monitoringJob.model");

async function getLini(req, res) {
    const { cab } = req.query;

    if (!cab) {
        return res.status(400).json({
            ok: false,
            message: "cab wajib diisi",
        });
    }

    try {
        const data = await monitoringJobModel.getLiniByCab({ cab });
        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

async function getKelompok(req, res) {
    const { cab, lini } = req.query;

    if (!cab || !lini) {
        return res.status(400).json({
            ok: false,
            message: "cab dan lini wajib diisi",
        });
    }

    try {
        const data = await monitoringJobModel.getKelompokByCabLini({ cab, lini });
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

        // hitung nilai rata-rata
        let total = 0;
        let count = 0;
        rows.forEach(r => {
            if (Number(r.persen) > 0) {
                total += Number(r.persen);
                count++;
            }
        });

        const avg = count === 0 ? 0 : Number((total / count).toFixed(2));

        res.json({
            ok: true,
            avg_persen: avg,
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
