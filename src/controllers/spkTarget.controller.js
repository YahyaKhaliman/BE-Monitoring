const { Lini } = require("../models/spkTarget.model");
const { MonjobSpk, Spk } = require("../models/spkTarget.model");

// Cari SPK by nomor
async function cariSpk(req, res) {
    const { nomor } = req.query;
    if (!nomor) {
        return res
            .status(400)
            .json({ ok: false, message: "Nomor SPK wajib diisi" });
    }
    try {
        const spk = await Spk.findOne({
            where: { spk_nomor: nomor },
            raw: true,
        });
        if (!spk) {
            return res
                .status(404)
                .json({ ok: false, message: "SPK tidak ditemukan" });
        }
        return res.json({ ok: true, data: spk });
    } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
    }
}

// Get lini
async function getLini(req, res) {
    try {
        const allowed = (req.query.allowed || "").trim();
        let where = {};
        if (allowed) {
            const list = allowed
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            if (list.length) where = { lini_kode: list };
        }

        const data = await Lini.findAll({
            where,
            order: [["lini_kode", "ASC"]],
            raw: true,
        });

        return res.json({ ok: true, data });
    } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
    }
}

// Get list
async function list(req, res) {
    const { lini } = req.query;
    if (!lini) {
        return res.status(400).json({ ok: false, message: "lini wajib diisi" });
    }

    try {
        const rows = await MonjobSpk.findAll({
            where: { ms_lini: lini },
            include: [
                {
                    model: Spk,
                    required: true,
                    where: { spk_close: 0 },
                    attributes: ["spk_nama"],
                },
            ],
            attributes: [
                ["ms_nomor", "nomor"],
                ["ms_targetperjam", "target"],
                ["date_create", "date_create"],
            ],
            order: [["ms_nomor", "ASC"]],
        });

        const data = rows.map((r) => ({
            nomor: r.get("nomor"),
            target: r.get("target"),
            nama: r.Spk?.spk_nama || "",
            tanggal: r.get("date_create"),
        }));

        return res.json({ ok: true, data });
    } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
    }
}

// Post SPK
async function create(req, res) {
    const { nomor, cab, lini, target_per_jam, user_create } = req.body;

    if (!nomor || !cab || !lini || !target_per_jam) {
        return res.status(400).json({
            ok: false,
            message: "nomor, cab, lini, target_per_jam wajib diisi",
        });
    }

    try {
        const exists = await MonjobSpk.findOne({
            where: { ms_nomor: nomor, ms_cab: cab, ms_lini: lini },
            raw: true,
        });

        if (exists) {
            return res.status(409).json({
                ok: false,
                message: "SPK ini sudah di seting targetnya",
            });
        }

        await MonjobSpk.create({
            ms_nomor: nomor,
            ms_cab: cab,
            ms_lini: lini,
            ms_targetperjam: Number(target_per_jam),
            user_create: user_create || null,
            date_create: new Date(),
        });

        return res.json({ ok: true, message: "Berhasil disimpan" });
    } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
    }
}

async function update(req, res) {
    const { nomor } = req.params;
    const { cab, lini, target_per_jam } = req.body;

    if (!nomor || !cab || !lini || !target_per_jam) {
        return res.status(400).json({
            ok: false,
            message: "nomor, cab, lini, target_per_jam wajib diisi",
        });
    }

    try {
        const [affected] = await MonjobSpk.update(
            {
                ms_targetperjam: Number(target_per_jam),
                date_modified: new Date(),
            },
            { where: { ms_nomor: nomor, ms_cab: cab, ms_lini: lini } },
        );

        if (!affected) {
            return res
                .status(404)
                .json({ ok: false, message: "Data tidak ditemukan" });
        }

        return res.json({ ok: true, message: "Berhasil diupdate" });
    } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
    }
}

async function remove(req, res) {
    const { nomor } = req.params;
    const { cab, lini } = req.query;

    if (!nomor || !cab || !lini) {
        return res
            .status(400)
            .json({ ok: false, message: "nomor, cab, lini wajib diisi" });
    }

    try {
        const affected = await MonjobSpk.destroy({
            where: { ms_nomor: nomor, ms_cab: cab, ms_lini: lini },
        });

        if (!affected) {
            return res
                .status(404)
                .json({ ok: false, message: "Data tidak ditemukan" });
        }

        return res.json({ ok: true, message: "Berhasil dihapus" });
    } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
    }
}

module.exports = { getLini, list, create, update, remove, cariSpk };
