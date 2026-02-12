const Realisasi = require("../models/realisasi.model");

async function jamOptions(req, res) {
    try {
        const data = await Realisasi.getJamOptions();
        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

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
        let validLini = null;
        let validKelompok = null;

        if (lini) {
            const okLini = await Realisasi.isValidLini({ cab, lini });
            if (okLini) validLini = lini;
        }

        if (kelompok && validLini) {
            const okKelompok = await Realisasi.isValidKelompok({
                cab,
                lini: validLini,
                kelompok,
            });
            if (okKelompok) validKelompok = kelompok;
        }

        const data = await Realisasi.listRealisasi({
            cab,
            tanggal,
            lini: validLini,
            kelompok: validKelompok,
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
        edit_mode,
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
        const mpDb = await Realisasi.getManPower({
            tanggal,
            cab,
            lini,
            kelompok,
        });
        if (Number(mpDb) <= 0) {
            return res.status(400).json({
                ok: false,
                message: "Man Power di Tgl tsb belum di input oleh Admin.",
            });
        }

        const isEdit = Boolean(edit_mode);
        if (!isEdit) {
            const exists = await Realisasi.existsJamSetting({
                tanggal,
                cab,
                lini,
                kelompok,
                jam,
            });
            if (exists) {
                return res.status(400).json({
                    ok: false,
                    message: "jam ini sudah di seting",
                });
            }
        }

        await Realisasi.upsertRealisasi({
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
        await Realisasi.deleteRealisasi({
            tanggal,
            cab,
            lini,
            kelompok,
            jam,
            spk,
        });

        res.json({ ok: true, message: "Data dihapus" });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
}

module.exports = { jamOptions, list, upsert, remove };
