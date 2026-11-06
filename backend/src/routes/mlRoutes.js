const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const { damageAnalysis, rescuePlan, route, allocate } = require("../controllers/mlController");

const router = express.Router();
router.use(authenticateToken);
router.post("/damage-analysis", damageAnalysis);
router.post("/rescue-plan", rescuePlan);
router.post("/route", route);
router.post("/allocate", allocate);
module.exports = router;
