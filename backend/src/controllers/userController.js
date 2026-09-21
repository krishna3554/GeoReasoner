const bcrypt = require("bcrypt");
const pool = require("../config/database");

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({
      users: result.rows,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;

    if (!name && !email && !role && is_active === undefined) {
      return res.status(400).json({
        message: "At least one field is required",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         is_active = COALESCE($4, is_active),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [
        name || null,
        email ? email.toLowerCase() : null,
        role || null,
        is_active !== undefined ? is_active : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    const allowedRoles = [
      "ADMIN",
      "INCIDENT_COMMANDER",
      "RESPONSE_TEAM",
      "ANALYST",
      "VIEWER",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [
        name,
        email.toLowerCase(),
        passwordHash,
        role,
      ]
    );

    res.status(201).json({
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Create user error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  createUser,
};