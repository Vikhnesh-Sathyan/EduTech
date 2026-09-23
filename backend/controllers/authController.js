// Handles user registration
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required registration data
if (!name || !email || !password) {
    return res.status(400).json({
        message: "Name, email and password are required"
    });
}

// Validate password length
if (password.length < 8) {
    return res.status(400).json({
        message: "Password must be at least 8 characters"
    });
}

        const checkUserSql = "SELECT id FROM users WHERE email = ?";

        db.query(checkUserSql, [email], async (err, result) => {
            if (err) {
                console.error("User check failed:", err.message);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (result.length > 0) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertUserSql = `
                INSERT INTO users (name, email, password)
                VALUES (?, ?, ?)
            `;

            db.query(
                insertUserSql,
                [name, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error("User registration failed:", err.message);

                        return res.status(500).json({
                            message: "Registration failed"
                        });
                    }

                    res.status(201).json({
                        message: "User registered successfully",
                        userId: result.insertId
                    });
                }
            );
        });
    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

// Handles user login and generates a JWT
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate login data
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const sql = `
            SELECT id, name, email, password, role, status
            FROM users
            WHERE email = ?
        `;

        db.query(sql, [email], async (err, result) => {
            if (err) {
                console.error("Login query failed:", err.message);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (result.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const user = result[0];

            if (user.status !== "active") {
                return res.status(403).json({
                    message: "Account is inactive"
                });
            }

            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};


// getMe → fetch the logged-in user's information from the database.

const getMe = (req, res) => {
    const sql = `
        SELECT id, name, email, role, status, created_at
        FROM users
        WHERE id = ?
    `;

    db.query(sql, [req.user.id], (err, result) => {
        if (err) {
            console.error("Get user failed:", err.message);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user: result[0]
        });
    });
};

module.exports = {
    register,
    login,
    getMe
};