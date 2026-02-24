const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

async function getLiniByCab({ cab, lini = "JAHIT" }) {
    const sql = `
        SELECT DISTINCT lini
        FROM tkelompok
        WHERE cab = :cab
            AND (:lini IS NULL OR :lini = '' OR lini = :lini)
        ORDER BY lini
    `;

    return sequelize.query(sql, {
        replacements: { cab, lini },
        type: QueryTypes.SELECT,
    });
}

async function getKelompokByCabLini({ cab, lini, kelompok = null }) {
    const sql = `
        SELECT DISTINCT kelompok
        FROM tkelompok
        WHERE cab = :cab
            AND lini = :lini
            AND (
                :kelompok IS NULL
                OR :kelompok = ''
                OR kelompok = :kelompok
                OR NOT EXISTS (
                    SELECT 1
                    FROM tkelompok t2
                    WHERE t2.cab = :cab
                        AND t2.lini = :lini
                        AND t2.kelompok = :kelompok
                )
            )
        ORDER BY kelompok
    `;

    return sequelize.query(sql, {
        replacements: { cab, lini, kelompok },
        type: QueryTypes.SELECT,
    });
}

async function getMonitoringPerJam({ cab, tanggal, lini, kelompok }) {
    if (String(kelompok).toUpperCase() === "ALL") {
        const sqlAll = `
            SELECT j.mj_jam jam,
                IFNULL(SUM(r.mr_mp),0) mp,
                IFNULL(GROUP_CONCAT(DISTINCT r.mr_spk_nomor ORDER BY r.mr_spk_nomor SEPARATOR ', '),'') spk,
                IFNULL(SUM(r.mr_target),0) target,
                IFNULL(SUM(r.mr_realisasi),0) realisasi,
                IFNULL(ROUND(SUM(r.mr_realisasi) / NULLIF(SUM(r.mr_target),0) * 100, 2),0) persen
            FROM monjob_jam j
            LEFT JOIN monjob_realisasi r
                ON r.mr_jam = j.mj_jam
                AND r.mr_tanggal = :tanggal
                AND r.mr_cab = :cab
                AND r.mr_lini = :lini
            GROUP BY j.mj_id, j.mj_jam
            ORDER BY j.mj_id
        `;

        return sequelize.query(sqlAll, {
            replacements: { cab, tanggal, lini },
            type: QueryTypes.SELECT,
        });
    }

    const sql = `
        SELECT j.mj_jam jam,
            IFNULL(r.mr_mp,0) mp,
            CONCAT(IFNULL(r.mr_spk_nomor,''),'\\r\\n',IFNULL(s.spk_nama,'')) spk,
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

    return sequelize.query(sql, {
        replacements: { cab, tanggal, lini, kelompok },
        type: QueryTypes.SELECT,
    });
}

async function getMonitoringAvgPersen({ cab, tanggal, lini, kelompok }) {
    const isAllKelompok = String(kelompok).toUpperCase() === "ALL";
    const sql = `
        SELECT IFNULL(
            ROUND(SUM(r.mr_realisasi) / NULLIF(SUM(r.mr_target),0) * 100, 2),
            0
        ) AS persen
        FROM monjob_realisasi r
        WHERE r.mr_tanggal = :tanggal
            AND r.mr_cab = :cab
            AND r.mr_lini = :lini
            ${isAllKelompok ? "" : "AND r.mr_kelompok = :kelompok"}
    `;

    const [row] = await sequelize.query(sql, {
        replacements: isAllKelompok
            ? { cab, tanggal, lini }
            : { cab, tanggal, lini, kelompok },
        type: QueryTypes.SELECT,
    });

    return Number(row?.persen || 0);
}

async function getMonitoringDetail({ cab, tanggal, lini, kelompok }) {
    const sql = `
            SELECT r.mr_spk_nomor spk,
                        s.spk_jumlah jmlspk,
                        SUM(r.mr_realisasi) jml,
                        COUNT(r.mr_spk_nomor) jam,
                        IFNULL((
                                    SELECT SUM(a.mr_realisasi)
                                    FROM monjob_realisasi a
                                    WHERE a.mr_cab = :cab
                                        AND a.mr_lini = :lini
                                        AND a.mr_spk_nomor = r.mr_spk_nomor
                        ),0) tjml
            FROM monjob_realisasi r
            INNER JOIN tspk s ON s.spk_nomor = r.mr_spk_nomor
            WHERE r.mr_tanggal = :tanggal
                AND r.mr_cab = :cab
                AND r.mr_lini = :lini
                AND r.mr_kelompok = :kelompok
            GROUP BY r.mr_spk_nomor
            ORDER BY r.mr_spk_nomor
        `;

    return sequelize.query(sql, {
        replacements: { cab, tanggal, lini, kelompok },
        type: QueryTypes.SELECT,
    });
}

module.exports = {
    getLiniByCab,
    getKelompokByCabLini,
    getMonitoringPerJam,
    getMonitoringAvgPersen,
    getMonitoringDetail,
};
