const pool = require("../config/database");

// GET all resources
const getResources = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM resources
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

// GET resource by ID
const getResourceById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM resources WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get resource error:", error);
    res.status(500).json({ message: "Failed to fetch resource" });
  }
};

// CREATE resource
const createResource = async (req, res) => {
  try {
    const {
      name,
      category,
      type,
      location,
      status = "Available",
      quantity,
      description,
    } = req.body;

    if (!name || !category || !type || !location || quantity === undefined) {
      return res.status(400).json({
        message: "Name, category, type, location and quantity are required",
      });
    }

    const allowedCategories = [
      "Rescue Teams",
      "Vehicles",
      "Supplies",
      "Shelters",
    ];

    const allowedStatuses = [
      "Available",
      "Deployed",
      "En Route",
      "Limited",
      "Active",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid resource category" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid resource status" });
    }

    if (Number.isNaN(Number(quantity)) || Number(quantity) < 0) {
      return res.status(400).json({
        message: "Quantity must be a non-negative number",
      });
    }

    // Generate resource code
    const codeResult = await pool.query(`
      SELECT COALESCE(
        MAX(CAST(SUBSTRING(resource_code FROM 5) AS INTEGER)),
        0
      ) + 1 AS next_number
      FROM resources
      WHERE resource_code ~ '^RES-[0-9]+$'
    `);

    const resourceCode = `RES-${String(
      codeResult.rows[0].next_number
    ).padStart(3, "0")}`;

    const result = await pool.query(
      `
      INSERT INTO resources (
        resource_code,
        name,
        category,
        type,
        location,
        status,
        quantity,
        description,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        resourceCode,
        name.trim(),
        category,
        type.trim(),
        location.trim(),
        status,
        Number(quantity),
        description || null,
        req.user.id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(500).json({ message: "Failed to create resource" });
  }
};

// UPDATE resource
const updateResource = async (req, res) => {
  try {
    const {
      name,
      category,
      type,
      location,
      status,
      quantity,
      description,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE resources
      SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        type = COALESCE($3, type),
        location = COALESCE($4, location),
        status = COALESCE($5, status),
        quantity = COALESCE($6, quantity),
        description = COALESCE($7, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
      `,
      [
        name,
        category,
        type,
        location,
        status,
        quantity !== undefined ? Number(quantity) : null,
        description,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update resource error:", error);
    res.status(500).json({ message: "Failed to update resource" });
  }
};

// DELETE resource
const deleteResource = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM resources WHERE id = $1 RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({ message: "Failed to delete resource" });
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
};