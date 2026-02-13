const router = require("express").Router();
const { laporan } = require("../controllers/laporan.controller");

router.get("/laporan", laporan);

module.exports = router;
