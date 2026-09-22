const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../config/upload");

const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
} = require("../controllers/incidentController");

const router = express.Router();

// Get all incidents
router.get(
  "/",
  authenticateToken,
  getIncidents
);

// Upload incident image
router.post(
  "/upload-image",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "INCIDENT_COMMANDER",
    "RESPONSE_TEAM"
  ),
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    res.status(201).json({
      message: "Image uploaded successfully",
      image_url: `/uploads/incidents/${req.file.filename}`,
    });
  }
);

// Get incident by ID
router.get(
  "/:id",
  authenticateToken,
  getIncidentById
);

// Create incident
router.post(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "INCIDENT_COMMANDER",
    "RESPONSE_TEAM"
  ),
  createIncident
);

// Update incident
router.patch(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "INCIDENT_COMMANDER",
    "RESPONSE_TEAM"
  ),
  updateIncident
);

// Delete incident
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "INCIDENT_COMMANDER"
  ),
  deleteIncident
);

module.exports = router;