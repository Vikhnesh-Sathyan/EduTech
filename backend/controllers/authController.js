// Handles user registration and authentication

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ==========================================
// REGISTER USER
// ==========================================

const register = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        // Validate required registration data

        if (!name || !email || !password) {

            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });

        }


        // Only student and mentor accounts can register

        if (
            role !== "student" &&
            role !== "mentor"
        ) {

            return res.status(400).json({
                message:
                    "Invalid account type"
            });

        }


        // Validate password length

        if (password.length < 8) {

            return res.status(400).json({
                message:
                    "Password must be at least 8 characters"
            });

        }


        // Check whether email already exists

        const checkUserSql = `
            SELECT id
            FROM users
            WHERE email = ?
        `;

        const [existingUsers] = await db.query(
            checkUserSql,
            [email]
        );


        // Stop duplicate registration

        if (existingUsers.length > 0) {

            return res.status(409).json({
                message:
                    "Email already registered"
            });

        }


        // Hash password before storing it

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Insert new user

        const insertUserSql = `
            INSERT INTO users
            (
                name,
                email,
                password,
                role
            )
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(
            insertUserSql,
            [
                name,
                email,
                hashedPassword,
                role
            ]
        );


        // Registration successful

        res.status(201).json({

            message:
                "User registered successfully",

            userId:
                result.insertId,

            role:
                role

        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({
            message:
                "Something went wrong"
        });

    }

};


// ==========================================
// LOGIN USER
// ==========================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Validate login data

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });

        }


        const sql = `
            SELECT
                u.id,
                u.name,
                u.email,
                u.password,
                u.role,
                u.status,
                mp.verification_status
            FROM users u
            LEFT JOIN mentor_profiles mp
                ON mp.user_id = u.id
            WHERE u.email = ?
        `;


        // Promise-style MySQL query

        const [result] = await db.query(
            sql,
            [email]
        );


        if (result.length === 0) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        const user = result[0];


        // Check account status

        if (user.status !== "active") {

            return res.status(403).json({
                message:
                    "Account is inactive"
            });

        }


        // Compare entered password with hashed password

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        // Generate JWT

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


        // Send login response

        res.status(200).json({

            message:
                "Login successful",

            token,

            user: {
                id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                verificationStatus:
                    user.verification_status || null
            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            message:
                "Something went wrong"
        });

    }

};


// ==========================================
// GET LOGGED-IN USER
// ==========================================

const getMe = async (req, res) => {

    try {

        const sql = `
            SELECT
                id,
                name,
                email,
                role,
                status,
                created_at
            FROM users
            WHERE id = ?
        `;


        const [result] = await db.query(
            sql,
            [req.user.id]
        );


        if (result.length === 0) {

            return res.status(404).json({
                message:
                    "User not found"
            });

        }


        res.status(200).json({
            user: result[0]
        });

    } catch (error) {

        console.error(
            "Get user failed:",
            error
        );

        res.status(500).json({
            message:
                "Database error"
        });

    }

};


module.exports = {
    register,
    login,
    getMe
};