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

module.exports = {
  getUsers,
  getUserById,
  updateUser,
};