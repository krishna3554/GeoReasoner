const pool = require("../config/database");

// Get all assignments
const getAssignments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ra.*,
        r.resource_code,
        r.name AS resource_name,
        r.category AS resource_category,
        i.incident_code,
        i.title AS incident_title
      FROM resource_assignments ra
      JOIN resources r ON r.id = ra.resource_id
      JOIN incidents i ON i.id = ra.incident_id
      ORDER BY ra.assigned_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

// Get assignments for one resource
const getResourceAssignments = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        ra.*,
        r.resource_code,
        r.name AS resource_name,
        i.incident_code,
        i.title AS incident_title
      FROM resource_assignments ra
      JOIN resources r ON r.id = ra.resource_id
      JOIN incidents i ON i.id = ra.incident_id
      WHERE ra.resource_id = $1
      ORDER BY ra.assigned_at DESC
      `,
      [req.params.resourceId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get resource assignments error:", error);
    res.status(500).json({
      message: "Failed to fetch resource assignments",
    });
  }
};

// Create assignment
const createAssignment = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      resource_id,
      incident_id,
      quantity,
    } = req.body;

    if (!resource_id || !incident_id || !quantity) {
      return res.status(400).json({
        message: "Resource, incident and quantity are required",
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Assignment quantity must be greater than 0",
      });
    }

    await client.query("BEGIN");

    // Lock resource row to prevent over-allocation
    const resourceResult = await client.query(
      `
      SELECT id, quantity, status
      FROM resources
      WHERE id = $1
      FOR UPDATE
      `,
      [resource_id]
    );

    if (resourceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Resource not found",
      });
    }

    const resource = resourceResult.rows[0];

    // Calculate currently allocated quantity
    const allocatedResult = await client.query(
      `
      SELECT COALESCE(SUM(quantity), 0) AS allocated
      FROM resource_assignments
      WHERE resource_id = $1
      AND status IN ('Assigned', 'Dispatched')
      `,
      [resource_id]
    );

    const allocated = Number(allocatedResult.rows[0].allocated);
    const requested = Number(quantity);

    if (allocated + requested > Number(resource.quantity)) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: `Insufficient available quantity. Available: ${
          Number(resource.quantity) - allocated
        }`,
      });
    }

    // Verify incident exists
    const incidentResult = await client.query(
      `SELECT id FROM incidents WHERE id = $1`,
      [incident_id]
    );

    if (incidentResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Incident not found",
      });
    }

    // Create assignment
    const assignmentResult = await client.query(
      `
      INSERT INTO resource_assignments (
        resource_id,
        incident_id,
        quantity,
        status,
        assigned_by
      )
      VALUES ($1, $2, $3, 'Assigned', $4)
      RETURNING *
      `,
      [
        resource_id,
        incident_id,
        requested,
        req.user.id,
      ]
    );

    // Update resource status
    const newAllocated = allocated + requested;
    let newStatus = resource.status;

    if (newAllocated >= Number(resource.quantity)) {
      newStatus = "Deployed";
    } else if (newAllocated > 0) {
      newStatus = "Deployed";
    }

    await client.query(
      `
      UPDATE resources
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [newStatus, resource_id]
    );

    await client.query("COMMIT");

    res.status(201).json(assignmentResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create assignment error:", error);

    res.status(500).json({
      message: "Failed to create resource assignment",
    });
  } finally {
    client.release();
  }
};

// Update assignment status
const updateAssignment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Assigned",
      "Dispatched",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid assignment status",
      });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `
      UPDATE resource_assignments
      SET
        status = $1,
        completed_at =
          CASE
            WHEN $1 IN ('Completed', 'Cancelled')
            THEN CURRENT_TIMESTAMP
            ELSE completed_at
          END
      WHERE id = $2
      RETURNING *
      `,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    await client.query("COMMIT");

    res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update assignment error:", error);

    res.status(500).json({
      message: "Failed to update assignment",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getAssignments,
  getResourceAssignments,
  createAssignment,
  updateAssignment,
};