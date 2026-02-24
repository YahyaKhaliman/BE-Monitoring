const express = require("express");
const router = require("express").Router();
const monitoringJob = require("../controllers/monitoringJob.controller");

router.get("/monitoring", monitoringJob.monitoringPerJam);
router.get("/monitoring/lini", monitoringJob.getLini);
router.get("/monitoring/kelompok", monitoringJob.getKelompok);
router.get("/monitoring/detail", monitoringJob.monitoringDetail);

module.exports = router;
