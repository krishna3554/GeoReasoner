const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getAssignments,
  getResourceAssignments,
  createAssignment,
  updateAssignment,
} = require("../controllers/resourceAssignmentController");

const router = express.Router();

// Get all assignments
router.get(
  "/",
  authenticateToken,
  getAssignments
);

// Get assignments for a specific resource
router.get(
  "/resource/:resourceId",
  authenticateToken,
  getResourceAssignments
);

// Assign resource to incident
router.post(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "INCIDENT_COMMANDER",
    "RESPONSE_TEAM"
  ),
  createAssignment
);

// Update assignment status
router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "INCIDENT_COMMANDER",
    "RESPONSE_TEAM"
  ),
  updateAssignment
);

module.exports = router;