const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// tlini
const Lini = sequelize.define(
    "Lini",
    {
        lini_kode: { type: DataTypes.STRING(3), primaryKey: true },
        lini_nama: { type: DataTypes.STRING(50), allowNull: true },
    },
    { tableName: "tlini", timestamps: false }
);

// tspk
const Spk = sequelize.define(
    "Spk",
    {
        spk_nomor: { type: DataTypes.STRING(20), primaryKey: true },
        spk_nama: { type: DataTypes.STRING(100), allowNull: true },
        spk_close: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    },
    { tableName: "tspk", timestamps: false }
);

// monjob_spk
const MonjobSpk = sequelize.define(
    "MonjobSpk",
    {
        ms_nomor: { type: DataTypes.STRING(20), allowNull: false, primaryKey: true },
        ms_cab: { type: DataTypes.STRING(3), allowNull: false, primaryKey: true },
        ms_lini: { type: DataTypes.STRING(20), allowNull: false, primaryKey: true },
        ms_targetperjam: { type: DataTypes.DOUBLE, allowNull: false, default: 0 },
        user_create: { type: DataTypes.STRING(10), allowNull: false },
        date_create: { type: DataTypes.DATE, allowNull: true, default: null },
        date_modified: { type: DataTypes.DATE, allowNull: true, default: null },
    },
    { tableName: "monjob_spk", timestamps: false, freezeTableName: true, id: false }
);

MonjobSpk.belongsTo(Spk, {
    foreignKey: "ms_nomor",
    targetKey: "spk_nomor",
    constraints: false,
});

module.exports = { sequelize, Lini, Spk, MonjobSpk };
