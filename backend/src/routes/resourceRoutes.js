const express = require("express");
const router = express.Router();

const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// View resources
router.get("/", authenticateToken, getResources);

// View single resource
router.get("/:id", authenticateToken, getResourceById);

// Create resource
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "INCIDENT_COMMANDER", "RESPONSE_TEAM"),
  createResource
);

// Update resource
router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "INCIDENT_COMMANDER", "RESPONSE_TEAM"),
  updateResource
);

// Delete resource
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "INCIDENT_COMMANDER"),
  deleteResource
);

module.exports = router;