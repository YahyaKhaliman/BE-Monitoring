const User = require("../models/user.model");

async function login(req, res) {
    const { user_kode, password } = req.body;

    if (!user_kode || !password) {
        return res.status(400).json({
        ok: false,
        message: "user_kode dan password wajib diisi",
        });
    }

    const user = await User.findOne({
        where: {
        user_kode: user_kode,
        user_password: password,
        },
    });

    if (!user) {
        return res.status(401).json({
        ok: false,
        message: "Kode User atau Password salah",
        });
    }

    return res.json({
        ok: true,
        data: {
            user_kode: user.user_kode,
            user_nama: user.user_nama,
            user_cab: user.user_cab,
            user_bagian: user.user_bagian,
            user_kelompok: user.user_kelompok,
        },
    });
}

async function changePassword(req, res) {
    const { user_kode, old_password, new_password } = req.body;

    if (!user_kode || !old_password || !new_password) {
        return res.status(400).json({
        ok: false,
        message: "user_kode, old_password, new_password wajib diisi",
        });
    }

    try {
        const user = await User.findOne({
        where: { user_kode },
        });

        if (!user) {
        return res.status(404).json({
            ok: false,
            message: "User tidak ditemukan / tidak aktif",
        });
        }

        if (user.user_password !== old_password) {
        return res.status(401).json({
            ok: false,
            message: "password lama anda salah",
        });
        }

        const [affected] = await User.update(
        { user_password: new_password },
        { where: { user_kode } }
        );

        if (!affected) {
        return res.status(500).json({
            ok: false,
            message: "Gagal mengubah password",
        });
        }

        return res.json({
        ok: true,
        message: "Password Berhasil di ubah",
        });
    } catch (e) {
        return res.status(500).json({ ok: false, message: e.message });
    }
}

module.exports = { login, changePassword };
