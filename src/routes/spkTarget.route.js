const express = require("express");
const router = require("express").Router();
const { getLini } = require("../controllers/spkTarget.controller");
const spkTarget = require('../controllers/spkTarget.controller');

router.get("/spk-lini", getLini);
router.get("/spk-target", spkTarget.list)
router.post("/spk-target", spkTarget.create)
router.put("/spk-target/:nomor", spkTarget.update)
router.delete("/spk-target/:nomor", spkTarget.remove)

module.exports = router;
