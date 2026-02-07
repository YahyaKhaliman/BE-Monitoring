const router = require("express").Router();
const { laporan } = require("../controllers/LAPORAN.controller");

router.get("/laporan", laporan);

module.exports = router;
