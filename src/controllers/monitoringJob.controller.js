const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

async function monitoringPerJam(req, res) {
    const { cab, tanggal, lini, kelompok } = req.query;

    if (!cab || !tanggal || !lini || !kelompok) {
        return res.status(400).json({
        ok: false,
        message: "cab, tanggal, lini, kelompok wajib diisi",
        });
    }

    try {
        const sql = `
        SELECT j.mj_jam jam,
                IFNULL(r.mr_mp,0) mp,
                CONCAT(IFNULL(r.mr_spk_nomor,''),'\\n',IFNULL(s.spk_nama,'')) spk,
                IFNULL(r.mr_target,0) target,
                IFNULL(r.mr_realisasi,0) realisasi,
                IFNULL(ROUND(r.mr_realisasi / NULLIF(r.mr_target,0) * 100, 2),0) persen
        FROM monjob_jam j
        LEFT JOIN monjob_realisasi r
            ON r.mr_jam = j.mj_jam
        AND r.mr_tanggal = :tanggal
        AND r.mr_cab = :cab
        AND r.mr_lini = :lini
        AND r.mr_kelompok = :kelompok
        LEFT JOIN tspk s ON s.spk_nomor = r.mr_spk_nomor
        ORDER BY j.mj_id
        `;

        const rows = await sequelize.query(sql, {
        replacements: { cab, tanggal, lini, kelompok },
        type: QueryTypes.SELECT,
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

    try {
        const sql = `
        SELECT r.mr_spk_nomor spk,
                s.spk_jumlah order_qty,
                SUM(r.mr_realisasi) output,
                COUNT(*) jam,
                IFNULL((
                SELECT SUM(a.mr_realisasi)
                FROM monjob_realisasi a
                WHERE a.mr_cab = :cab
                    AND a.mr_lini = :lini
                    AND a.mr_spk_nomor = r.mr_spk_nomor
                ),0) total_output
        FROM monjob_realisasi r
        INNER JOIN tspk s ON s.spk_nomor = r.mr_spk_nomor
        WHERE r.mr_tanggal = :tanggal
            AND r.mr_cab = :cab
            AND r.mr_lini = :lini
            AND r.mr_kelompok = :kelompok
        GROUP BY r.mr_spk_nomor
        ORDER BY r.mr_spk_nomor
        `;

        const data = await sequelize.query(sql, {
        replacements: { cab, tanggal, lini, kelompok },
        type: QueryTypes.SELECT,
        });

        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

module.exports = { monitoringPerJam, monitoringDetail };
