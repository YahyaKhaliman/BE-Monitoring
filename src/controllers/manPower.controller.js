const ManPower = require("../models/manPower.model");
const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

// Get list
async function list(req, res) {
    const { lini, tanggal, kelompok } = req.query;

    if (!lini || !tanggal) {
        return res.status(400).json({
            ok: false,
            message: "lini dan tanggal wajib diisi",
        });
    }

    try {
        let sql =
            `SELECT DATE_FORMAT(mm_tanggal,'%d-%m-%Y') tanggal,
                    mm_kelompok kelompok,
                    mm_mp mp
            FROM monjob_manpower
            WHERE mm_lini = :lini
                AND mm_tanggal = :tanggal`;

        if (kelompok) {
            sql += " AND mm_kelompok = :kelompok";
        }

        sql += " ORDER BY mm_kelompok";

        const data = await sequelize.query(sql, {
            replacements: { lini, tanggal, kelompok },
            type: QueryTypes.SELECT,
        });

        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

// Create
async function create(req, res) {
    const { tanggal, cab, lini, kelompok, mp, user } = req.body;

    if (!tanggal || !cab || !lini || !kelompok || !mp) {
        return res.status(400).json({
        ok: false,
        message: "data tidak lengkap",
        });
    }

    if (Number(mp) <= 0) {
        return res.status(400).json({
        ok: false,
        message: "Man Power harus lebih dari 0",
        });
    }

    try {
        const exists = await ManPower.findOne({
        where: {
            mm_tanggal: tanggal,
            mm_cab: cab,
            mm_lini: lini,
            mm_kelompok: kelompok,
        },
        });

        if (exists) {
        return res.status(409).json({
            ok: false,
            message: "Man power tanggal dan lini ini sudah di setting",
        });
        }

        await ManPower.create({
        mm_tanggal: tanggal,
        mm_cab: cab,
        mm_lini: lini,
        mm_kelompok: kelompok,
        mm_mp: mp,
        user_create: user || null,
        });

        res.json({ ok: true, message: "Berhasil disimpan" });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

// Update
async function update(req, res) {
    const { tanggal, cab, lini, kelompok, mp } = req.body;

    try {
        const [affected] = await ManPower.update(
        { mm_mp: mp },
        {
            where: {
            mm_tanggal: tanggal,
            mm_cab: cab,
            mm_lini: lini,
            mm_kelompok: kelompok,
            },
        }
        );

        if (!affected) {
        return res.status(404).json({
            ok: false,
            message: "Data tidak ditemukan",
        });
        }

        res.json({ ok: true, message: "Berhasil diupdate" });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
    }

// Delete
async function remove(req, res) {
    const { tanggal, cab, lini, kelompok } = req.query;

    try {
        await ManPower.destroy({
        where: {
            mm_tanggal: tanggal,
            mm_cab: cab,
            mm_lini: lini,
            mm_kelompok: kelompok,
        },
        });

        res.json({ ok: true, message: "Berhasil dihapus" });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

module.exports = { list, create, update, remove };
