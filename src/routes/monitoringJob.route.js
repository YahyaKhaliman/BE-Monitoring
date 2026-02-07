const express = require("express");
const router = require("express").Router();
const monitoringJob = require("../controllers/monitoringJob.controller");
const { route } = require("./user.route");

router.get("/monitoring", monitoringJob.monitoringPerJam);
router.get("/monitoring/detail", monitoringJob.monitoringDetail);

module.exports = router