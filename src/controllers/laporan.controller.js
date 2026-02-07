const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

async function laporan(req, res) {
    const { cab, date_from, date_to, lini, kelompok, spk } = req.query;

    if (!date_from || !date_to) {
        return res.status(400).json({
        ok: false,
        message: "date_from, date_to wajib diisi",
        });
    }

    try {
    let where = `
        WHERE r.mr_tanggal BETWEEN :date_from AND :date_to
    `;
    const repl = { date_from, date_to };

    if (cab) {
        where += " AND r.mr_cab = :cab";
        repl.cab = cab;
    }

    if (lini) {
        where += " AND r.mr_lini = :lini";
        repl.lini = lini;
    }
    if (kelompok) {
        where += " AND r.mr_kelompok = :kelompok";
        repl.kelompok = kelompok;
    }
    if (spk) {
        where += " AND r.mr_spk_nomor = :spk";
        repl.spk = spk;
    }

    const summarySql = `
        SELECT
            IFNULL(SUM(r.mr_target),0) total_target,
            IFNULL(SUM(r.mr_realisasi),0) total_realisasi,
            IFNULL(
            ROUND(SUM(r.mr_realisasi) / NULLIF(SUM(r.mr_target),0) * 100, 2),
            0
            ) persen
        FROM monjob_realisasi r
        ${where}
    `;

    const byDateSql = `
        SELECT
            DATE_FORMAT(r.mr_tanggal, '%Y-%m-%d') tanggal,
            IFNULL(SUM(r.mr_target),0) target,
            IFNULL(SUM(r.mr_realisasi),0) realisasi,
            IFNULL(
            ROUND(SUM(r.mr_realisasi) / NULLIF(SUM(r.mr_target),0) * 100, 2),
            0
            ) persen
        FROM monjob_realisasi r
        ${where}
        GROUP BY r.mr_tanggal
        ORDER BY r.mr_tanggal
    `;

    const cabFilter = cab ? " AND a.mr_cab = :cab" : "";

    const bySpkSql = `
        SELECT
            r.mr_spk_nomor spk,
            s.spk_tanggal,
            s.spk_dateline,
            s.spk_nama,
            s.spk_jumlah AS jml_order,
            IFNULL((
                SELECT SUM(s.spk_jumlah_jadi)
                FROM tspk s
                WHERE s.spk_nomor = r.mr_spk_nomor
                ${cabFilter}
            ),0) AS total_realisasi,
            (IFNULL((
                SELECT SUM(s.spk_jumlah_jadi)
                FROM tspk s
                WHERE s.spk_nomor = r.mr_spk_nomor
                    ${cabFilter}
                ), 0)
                - s.spk_jumlah
            ) AS sisa,
            IFNULL(SUM(r.mr_target),0) AS target,
            IFNULL(SUM(r.mr_realisasi),0) AS realisasi,
            IFNULL(
                ROUND(SUM(r.mr_realisasi) / NULLIF(SUM(r.mr_target),0) * 100, 2),
                0
            ) AS persen,
            s.spk_close
            FROM monjob_realisasi r
            INNER JOIN tspk s ON s.spk_nomor = r.mr_spk_nomor
            ${where}
            GROUP BY
            r.mr_spk_nomor,
            s.spk_tanggal,
            s.spk_dateline,
            s.spk_nama,
            s.spk_jumlah,
            s.spk_close
            ORDER BY r.mr_spk_nomor
    `;

    const [summaryRow] = await sequelize.query(summarySql, {
        replacements: repl,
        type: QueryTypes.SELECT,
    });

    const by_date = await sequelize.query(byDateSql, {
        replacements: repl,
        type: QueryTypes.SELECT,
    });

    const by_spk = await sequelize.query(bySpkSql, {
        replacements: repl,
        type: QueryTypes.SELECT,
    });

    return res.json({
        ok: true,
        summary: summaryRow || {
            total_target: 0,
            total_realisasi: 0,
            persen: 0,
        },
        by_date,
        by_spk,
    });
    } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
    }
}

module.exports = { laporan };
