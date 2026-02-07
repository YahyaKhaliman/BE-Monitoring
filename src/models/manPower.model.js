const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ManPower = sequelize.define(
    "ManPower",
    {
        mm_tanggal: { type: DataTypes.DATEONLY, allowNull: false, primaryKey: true },
        mm_cab: { type: DataTypes.STRING(3), allowNull: false, primaryKey: true },
        mm_lini: { type: DataTypes.STRING(20), allowNull: false, primaryKey: true },
        mm_kelompok: { type: DataTypes.STRING(20), allowNull: false, primaryKey: true },
        mm_mp: { type: DataTypes.INTEGER, allowNull: false },
        user_create: { type: DataTypes.STRING(10), allowNull: false },
    },
    {
        tableName: "monjob_manpower",
        timestamps: false,
    }
);

module.exports = ManPower;
