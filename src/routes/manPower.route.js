const express = require("express");
const router = require("express").Router();
const manpower = require("../controllers/manPower.controller");

router.get("/manpower", manpower.list);
router.post("/manpower", manpower.create);
router.put("/manpower", manpower.update);
router.delete("/manpower", manpower.remove);

module.exports = router;