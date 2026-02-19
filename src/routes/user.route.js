const express = require("express");
const router = require("express").Router();
const { login, changePassword } = require("../controllers/user.controller");
const { authenticateToken } = require("../middleware/auth");

router.post("/admin/login", login);
router.use(authenticateToken);
router.put("/admin/change-password", changePassword);

module.exports = router;
