const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

// LIST REALISASI
async function list(req, res) {
    const { cab, tanggal, lini, kelompok } = req.query;

    if (!cab || !tanggal) {
        return res.status(400).json({
        ok: false,
        message: "cab dan tanggal wajib diisi",
        });
    }

    try {
        let sql = `
        SELECT DATE_FORMAT(mr_tanggal,'%Y-%m-%d') tanggal,
                mr_lini lini,
                mr_kelompok kelompok,
                mr_jam jam,
                mr_spk_nomor spk,
                spk_nama,
                mr_realisasi,
                mr_target
        FROM monjob_realisasi
        INNER JOIN tspk ON spk_nomor = mr_spk_nomor
        WHERE mr_cab = :cab
            AND mr_tanggal = :tanggal
        `;

        if (lini) sql += " AND mr_lini = :lini";
        if (kelompok) sql += " AND mr_kelompok = :kelompok";

        sql += " ORDER BY mr_lini, mr_kelompok, mr_jam";

        const data = await sequelize.query(sql, {
        replacements: { cab, tanggal, lini, kelompok },
        type: QueryTypes.SELECT,
        });

        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

// CREATE / UPDATE (UPSERT)
async function upsert(req, res) {
    const {
        tanggal,
        cab,
        lini,
        kelompok,
        jam,
        spk,
        realisasi,
        target,
        mp,
        user,
    } = req.body;

    if (!lini || !kelompok || !jam || !spk) {
        return res.status(400).json({
        ok: false,
        message: "Lini, Kelompok, Jam, dan SPK wajib diisi",
        });
    }

    if (Number(mp) <= 0) {
        return res.status(400).json({
        ok: false,
        message: "Man Power belum diinput",
        });
    }

    try {
        const sql = `
        INSERT INTO monjob_realisasi
        (mr_tanggal, mr_cab, mr_lini, mr_kelompok, mr_jam,
        mr_spk_nomor, mr_realisasi, mr_target, mr_mp, user_create, date_create)
        VALUES
        (:tanggal, :cab, :lini, :kelompok, :jam,
        :spk, :realisasi, :target, :mp, :user, NOW())
        ON DUPLICATE KEY UPDATE
            mr_realisasi = :realisasi
        `;

        await sequelize.query(sql, {
        replacements: {
            tanggal,
            cab,
            lini,
            kelompok,
            jam,
            spk,
            realisasi,
            target,
            mp,
            user,
        },
        type: QueryTypes.INSERT,
        });

        res.json({ ok: true, message: "Realisasi tersimpan" });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

// DELETE
async function remove(req, res) {
    const { tanggal, cab, lini, kelompok, jam, spk } = req.query;

    try {
        const sql = `
        DELETE FROM monjob_realisasi
        WHERE mr_tanggal = :tanggal
            AND mr_cab = :cab
            AND mr_lini = :lini
            AND mr_kelompok = :kelompok
            AND mr_jam = :jam
            AND mr_spk_nomor = :spk
        `;

        await sequelize.query(sql, {
        replacements: { tanggal, cab, lini, kelompok, jam, spk },
        type: QueryTypes.DELETE,
        });

        res.json({ ok: true, message: "Data dihapus" });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

module.exports = { list, upsert, remove };
