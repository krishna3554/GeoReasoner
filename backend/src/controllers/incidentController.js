const pool = require("../config/database");

const getIncidents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        incident_code,
        title,
        type,
        severity,
        status,
        location,
        latitude,
        longitude,
        description,
        confidence,
        affected_people,
        assigned_unit,
        image_url,
        ai_damage_level,
        ai_recommendation,
        created_by,
        created_at,
        updated_at
      FROM incidents
      ORDER BY created_at DESC
    `);

    res.json({
      incidents: result.rows,
    });
  } catch (error) {
    console.error("Get incidents error:", error);

    res.status(500).json({
      message: "Failed to fetch incidents",
    });
  }
};

const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    const incidentResult = await pool.query(
      `
      SELECT
        id,
        incident_code,
        title,
        type,
        severity,
        status,
        location,
        latitude,
        longitude,
        description,
        confidence,
        affected_people,
        assigned_unit,
        image_url,
        ai_damage_level,
        ai_recommendation,
        created_by,
        created_at,
        updated_at
      FROM incidents
      WHERE id = $1
      `,
      [id]
    );

    if (incidentResult.rows.length === 0) {
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    const insightsResult = await pool.query(
      `
      SELECT id, insight, created_at
      FROM incident_insights
      WHERE incident_id = $1
      ORDER BY created_at ASC
      `,
      [id]
    );

    res.json({
      incident: incidentResult.rows[0],
      insights: insightsResult.rows,
    });
  } catch (error) {
    console.error("Get incident error:", error);

    res.status(500).json({
      message: "Failed to fetch incident",
    });
  }
};

const createIncident = async (req, res) => {
  try {
    const {
      title,
      type,
      severity,
      location,
      latitude,
      longitude,
      description,
      confidence,
      affected_people,
      assigned_unit,
      image_url,
      ai_damage_level,
      ai_recommendation,
      insights = [],
    } = req.body;

    const allowedTypes = [
    "Flood",
    "Structural",
    "Infrastructure",
    "Shelter",
    ];

    const allowedSeverities = [
    "HIGH",
    "MEDIUM",
    "LOW",
    ];

    if (!title?.trim() || !type || !location?.trim()) {
    return res.status(400).json({
        message: "Title, type and location are required",
    });
    }

    if (!allowedTypes.includes(type)) {
    return res.status(400).json({
        message: "Invalid incident type",
    });
    }

    if (severity && !allowedSeverities.includes(severity)) {
    return res.status(400).json({
        message: "Invalid severity",
    });
    }

    if (
    confidence !== undefined &&
    confidence !== null &&
    (Number(confidence) < 0 || Number(confidence) > 100)
    ) {
    return res.status(400).json({
        message: "Confidence must be between 0 and 100",
    });
    }

    if (
    affected_people !== undefined &&
    (Number.isNaN(Number(affected_people)) ||
        Number(affected_people) < 0)
    ) {
    return res.status(400).json({
        message: "Affected people cannot be negative",
    });
    }

    const codeResult = await pool.query(`
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(incident_code FROM 5) AS INTEGER)),
        0
    ) + 1 AS next_number
    FROM incidents
    WHERE incident_code ~ '^INC-[0-9]+$'
    `);

    const incidentCode = `INC-${String(
    codeResult.rows[0].next_number
    ).padStart(3, "0")}`;

    const result = await pool.query(
      `
      INSERT INTO incidents (
        incident_code,
        title,
        type,
        severity,
        location,
        latitude,
        longitude,
        description,
        confidence,
        affected_people,
        assigned_unit,
        image_url,
        ai_damage_level,
        ai_recommendation,
        created_by
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15
      )
      RETURNING *
      `,
      [
        incidentCode,
        title,
        type,
        severity || "LOW",
        location,
        latitude || null,
        longitude || null,
        description || null,
        confidence || null,
        affected_people || 0,
        assigned_unit || "Unassigned",
        image_url || null,
        ai_damage_level || null,
        ai_recommendation || null,
        req.user.userId,
      ]
    );

    const incident = result.rows[0];

    for (const insight of insights) {
      if (insight?.trim()) {
        await pool.query(
          `
          INSERT INTO incident_insights (incident_id, insight)
          VALUES ($1, $2)
          `,
          [incident.id, insight.trim()]
        );
      }
    }

    res.status(201).json({
      message: "Incident created successfully",
      incident,
    });
  } catch (error) {
    console.error("Create incident error:", error);

    res.status(500).json({
      message: "Failed to create incident",
    });
  }
};

const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      type,
      severity,
      status,
      location,
      latitude,
      longitude,
      description,
      confidence,
      affected_people,
      assigned_unit,
      image_url,
      ai_damage_level,
      ai_recommendation,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE incidents
      SET
        title = COALESCE($1, title),
        type = COALESCE($2, type),
        severity = COALESCE($3, severity),
        status = COALESCE($4, status),
        location = COALESCE($5, location),
        latitude = COALESCE($6, latitude),
        longitude = COALESCE($7, longitude),
        description = COALESCE($8, description),
        confidence = COALESCE($9, confidence),
        affected_people = COALESCE($10, affected_people),
        assigned_unit = COALESCE($11, assigned_unit),
        image_url = COALESCE($12, image_url),
        ai_damage_level = COALESCE($13, ai_damage_level),
        ai_recommendation = COALESCE($14, ai_recommendation),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *
      `,
      [
        title,
        type,
        severity,
        status,
        location,
        latitude,
        longitude,
        description,
        confidence,
        affected_people,
        assigned_unit,
        image_url,
        ai_damage_level,
        ai_recommendation,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    res.json({
      message: "Incident updated successfully",
      incident: result.rows[0],
    });
  } catch (error) {
    console.error("Update incident error:", error);

    res.status(500).json({
      message: "Failed to update incident",
    });
  }
};

const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM incidents WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    res.json({
      message: "Incident deleted successfully",
    });
  } catch (error) {
    console.error("Delete incident error:", error);

    res.status(500).json({
      message: "Failed to delete incident",
    });
  }
};

module.exports = {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
};