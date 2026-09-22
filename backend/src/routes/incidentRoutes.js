const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  getResources
);

router.get(
  "/:id",
  authenticateToken,
  getResourceById
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "INCIDENT_COMMANDER",
    "RESPONSE_TEAM"
  ),
  createResource
);

router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "INCIDENT_COMMANDER",
    "RESPONSE_TEAM"
  ),
  updateResource
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "INCIDENT_COMMANDER"),
  deleteResource
);

module.exports = router;