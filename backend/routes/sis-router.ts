const express = require("express");
const router = express.Router();

const classesController = require("../controllers/classes-controller");

router.get("/csFall2023", classesController.cs_classes_fall23);

module.exports = router;