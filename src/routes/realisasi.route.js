const express = require("express");
const router = require("express").Router();
const realisasi = require("../controllers/realisasi.controller");

router.get("/realisasi", realisasi.list);
router.post("/realisasi", realisasi.upsert);
router.delete("/realisasi", realisasi.remove);

module.exports = router;