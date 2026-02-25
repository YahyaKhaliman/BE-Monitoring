const laporanModel = require("../models/laporan.model");

async function laporan(req, res) {
    const { cab, date_from, date_to, lini, kelompok, spk } = req.query;

    if (!date_from || !date_to) {
        return res.status(400).json({
            ok: false,
            message: "date_from, date_to wajib diisi",
        });
    }

    try {
        const { summary, by_date, by_per_line, by_spk } = await laporanModel.getLaporanData({
            cab,
            date_from,
            date_to,
            lini,
            kelompok,
            spk,
        });

        return res.json({
            ok: true,
            summary,
            by_date,
            by_per_line,
            by_spk,
        });
    } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
    }
}

module.exports = { laporan };
