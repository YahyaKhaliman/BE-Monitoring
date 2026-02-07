const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Realisasi = sequelize.define(
    "Realisasi",
    {
        mr_tanggal: { type: DataTypes.DATEONLY, allowNull: false, primaryKey: true },
        mr_cab: { type: DataTypes.STRING(3), allowNull: false, primaryKey: true },
        mr_lini: { type: DataTypes.STRING(20), allowNull: false, primaryKey: true },
        mr_kelompok: { type: DataTypes.STRING(20), allowNull: false, primaryKey: true },
        mr_jam: { type: DataTypes.STRING(20), allowNull: false, primaryKey: true },
        mr_spk_nomor: { type: DataTypes.STRING(20), allowNull: false },
        mr_realisasi: { type: DataTypes.DOUBLE, allowNull: false },
        mr_target: { type: DataTypes.DOUBLE, allowNull: false },
        mr_mp: { type: DataTypes.INTEGER, allowNull: false },
        user_create: { type: DataTypes.STRING(50), allowNull: false },
        date_create: { type: DataTypes.DATE, allowNull: true },
    },
    {
        tableName: "monjob_realisasi",
        timestamps: false,
    }
);

module.exports = Realisasi;
