const express = require("express");
const router = require("express").Router();
const { login, changePassword } = require("../controllers/user.controller");

router.post("/admin/login", login);
router.put("/admin/change-password", changePassword)

module.exports = router;
