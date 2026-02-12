const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");

const Realisasi = sequelize.define(
    "Realisasi",
    {
        mr_tanggal: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            primaryKey: true,
        },
        mr_cab: {
            type: DataTypes.STRING(3),
            allowNull: false,
            primaryKey: true,
        },
        mr_lini: {
            type: DataTypes.STRING(20),
            allowNull: false,
            primaryKey: true,
        },
        mr_kelompok: {
            type: DataTypes.STRING(20),
            allowNull: false,
            primaryKey: true,
        },
        mr_jam: {
            type: DataTypes.STRING(20),
            allowNull: false,
            primaryKey: true,
        },
        mr_spk_nomor: {
            type: DataTypes.STRING(20),
            allowNull: false,
            primaryKey: true,
        },
        mr_realisasi: { type: DataTypes.DOUBLE, allowNull: false },
        mr_target: { type: DataTypes.DOUBLE, allowNull: false },
        mr_mp: { type: DataTypes.INTEGER, allowNull: false },
        user_create: { type: DataTypes.STRING(50), allowNull: false },
        date_create: { type: DataTypes.DATE, allowNull: true },
    },
    {
        tableName: "monjob_realisasi",
        timestamps: false,
    },
);

Realisasi.getJamOptions = async function getJamOptions() {
    const sql = `SELECT mj_jam jam FROM monjob_jam ORDER BY mj_id`;
    return sequelize.query(sql, { type: QueryTypes.SELECT });
};

Realisasi.isValidLini = async function isValidLini({ cab, lini }) {
    const sql = `
        SELECT 1
        FROM tkelompok
        WHERE cab = :cab
            AND lini = :lini
        LIMIT 1
    `;
    const rows = await sequelize.query(sql, {
        replacements: { cab, lini },
        type: QueryTypes.SELECT,
    });
    return rows.length > 0;
};

Realisasi.isValidKelompok = async function isValidKelompok({
    cab,
    lini,
    kelompok,
}) {
    const sql = `
        SELECT 1
        FROM tkelompok
        WHERE cab = :cab
            AND lini = :lini
            AND kelompok = :kelompok
        LIMIT 1
    `;
    const rows = await sequelize.query(sql, {
        replacements: { cab, lini, kelompok },
        type: QueryTypes.SELECT,
    });
    return rows.length > 0;
};

Realisasi.listRealisasi = async function listRealisasi({
    cab,
    tanggal,
    lini,
    kelompok,
}) {
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

    return sequelize.query(sql, {
        replacements: { cab, tanggal, lini, kelompok },
        type: QueryTypes.SELECT,
    });
};

Realisasi.getManPower = async function getManPower({
    tanggal,
    cab,
    lini,
    kelompok,
}) {
    const sql = `
        SELECT mm_mp
        FROM monjob_manpower
        WHERE mm_tanggal = :tanggal
            AND mm_cab = :cab
            AND mm_lini = :lini
            AND mm_kelompok = :kelompok
        LIMIT 1
    `;
    const rows = await sequelize.query(sql, {
        replacements: { tanggal, cab, lini, kelompok },
        type: QueryTypes.SELECT,
    });
    return rows[0]?.mm_mp ?? 0;
};

Realisasi.existsJamSetting = async function existsJamSetting({
    tanggal,
    cab,
    lini,
    kelompok,
    jam,
}) {
    const sql = `
        SELECT mr_kelompok
        FROM monjob_realisasi
        WHERE mr_tanggal = :tanggal
            AND mr_cab = :cab
            AND mr_lini = :lini
            AND mr_kelompok = :kelompok
            AND mr_jam = :jam
        LIMIT 1
    `;
    const rows = await sequelize.query(sql, {
        replacements: { tanggal, cab, lini, kelompok, jam },
        type: QueryTypes.SELECT,
    });
    return rows.length > 0;
};

Realisasi.upsertRealisasi = async function upsertRealisasi({
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
}) {
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

    return sequelize.query(sql, {
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
};

Realisasi.deleteRealisasi = async function deleteRealisasi({
    tanggal,
    cab,
    lini,
    kelompok,
    jam,
    spk,
}) {
    const sql = `
        DELETE FROM monjob_realisasi
        WHERE mr_tanggal = :tanggal
            AND mr_cab = :cab
            AND mr_lini = :lini
            AND mr_kelompok = :kelompok
            AND mr_jam = :jam
            AND mr_spk_nomor = :spk
    `;
    return sequelize.query(sql, {
        replacements: { tanggal, cab, lini, kelompok, jam, spk },
        type: QueryTypes.DELETE,
    });
};

module.exports = Realisasi;
