const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    user_kode: { type: DataTypes.STRING(10), allowNull: false, primaryKey: true },
    user_password: { type: DataTypes.STRING(15), allowNull: false },
    user_nama: { type: DataTypes.STRING(30), allowNull: false },
    user_bagian: { type: DataTypes.STRING(15), allowNull: true },
  },
  { tableName: "tuser", underscored: true, timestamps: false }
);

module.exports = User;
