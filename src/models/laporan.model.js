const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

function buildWhereAndReplacements({ cab, date_from, date_to, lini, kelompok, spk }) {
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

    return { where, repl };
}

async function getLaporanData({ cab, date_from, date_to, lini, kelompok, spk }) {
    const { where, repl } = buildWhereAndReplacements({
        cab,
        date_from,
        date_to,
        lini,
        kelompok,
        spk,
    });

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

    const byPerLineSql = `
        SELECT
            r.mr_kelompok line,
            IFNULL(SUM(r.mr_target),0) target,
            IFNULL(SUM(r.mr_realisasi),0) realisasi,
            IFNULL(
                ROUND(SUM(r.mr_realisasi) / NULLIF(SUM(r.mr_target),0) * 100, 2),
                0
            ) persen
        FROM monjob_realisasi r
        ${where}
        GROUP BY r.mr_kelompok
        ORDER BY r.mr_kelompok
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
                SELECT SUM(a.mr_realisasi)
                FROM monjob_realisasi a
                WHERE a.mr_spk_nomor = r.mr_spk_nomor
                    AND a.mr_tanggal BETWEEN '2025-01-01' AND :date_to
                    ${cabFilter}
            ),0) AS total_realisasi,
            (IFNULL((
                SELECT SUM(a.mr_realisasi)
                FROM monjob_realisasi a
                WHERE a.mr_spk_nomor = r.mr_spk_nomor
                    AND a.mr_tanggal BETWEEN '2025-01-01' AND :date_to
                    ${cabFilter}
            ), 0)
                - s.spk_jumlah
            ) AS sisa,
            IFNULL(SUM(r.mr_target),0) AS target,
            IFNULL(SUM(r.mr_realisasi),0) AS realisasi,
            IFNULL(
                ROUND(SUM(r.mr_realisasi) / NULLIF(SUM(s.spk_jumlah),0) * 100, 2),
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

    const by_per_line = await sequelize.query(byPerLineSql, {
        replacements: repl,
        type: QueryTypes.SELECT,
    });

    return {
        summary: summaryRow || {
            total_target: 0,
            total_realisasi: 0,
            persen: 0,
        },
        by_date,
        by_per_line,
        by_spk,
    };
}

module.exports = {
    getLaporanData,
};
