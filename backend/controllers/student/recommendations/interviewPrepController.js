const db = require("../../../config/db");

// ==========================================
// CREATE INTERVIEW PREPARATION POST
// ==========================================
const createInterviewPrep = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can create interview preparation posts."
            });
        }

        const {
            subject_id,
            title,
            description,
            prep_type,
            content,
            difficulty
        } = req.body;

        const allowedTypes = [
            "technical_question",
            "coding_challenge",
            "hr_question",
            "interview_experience",
            "preparation_tip"
        ];

        const allowedDifficulties = [
            "beginner",
            "intermediate",
            "advanced"
        ];

        if (
            !title?.trim() ||
            !content?.trim() ||
            !prep_type
        ) {
            return res.status(400).json({
                message: "Title, content, and preparation type are required."
            });
        }

        if (title.trim().length > 200) {
            return res.status(400).json({
                message: "Title cannot exceed 200 characters."
            });
        }

        if (!allowedTypes.includes(prep_type)) {
            return res.status(400).json({
                message: "Invalid interview preparation type."
            });
        }

        if (
            difficulty &&
            !allowedDifficulties.includes(difficulty)
        ) {
            return res.status(400).json({
                message: "Invalid difficulty level."
            });
        }

        const normalizedSubjectId =
            subject_id === "" || subject_id === undefined || subject_id === null
                ? null
                : Number(subject_id);

        if (
            normalizedSubjectId !== null &&
            (!Number.isInteger(normalizedSubjectId) ||
                normalizedSubjectId <= 0)
        ) {
            return res.status(400).json({
                message: "Invalid subject ID."
            });
        }

        if (normalizedSubjectId !== null) {
            const [subjects] = await db.query(
                "SELECT id FROM subjects WHERE id = ?",
                [normalizedSubjectId]
            );

            if (subjects.length === 0) {
                return res.status(404).json({
                    message: "Subject not found."
                });
            }
        }

        const [result] = await db.query(
            `INSERT INTO student_interview_prep
            (
                student_id,
                subject_id,
                title,
                description,
                prep_type,
                content,
                difficulty
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                normalizedSubjectId,
                title.trim(),
                description?.trim() || null,
                prep_type,
                content.trim(),
                difficulty || null
            ]
        );

        return res.status(201).json({
            message: "Interview preparation post created successfully.",
            id: result.insertId
        });
    } catch (error) {
        console.error("Create interview prep error:", error);

        return res.status(500).json({
            message: "Failed to create interview preparation post."
        });
    }
};

// ==========================================
// GET ALL INTERVIEW PREPARATION POSTS
// ==========================================
const getAllInterviewPrep = async (req, res) => {
    try {
        const {
            prep_type,
            subject_id,
            difficulty,
            search,
            sort
        } = req.query;

        const allowedTypes = [
            "technical_question",
            "coding_challenge",
            "hr_question",
            "interview_experience",
            "preparation_tip"
        ];

        const allowedDifficulties = [
            "beginner",
            "intermediate",
            "advanced"
        ];

        const conditions = [];
        const values = [];

        if (prep_type) {
            if (!allowedTypes.includes(prep_type)) {
                return res.status(400).json({
                    message: "Invalid preparation type filter."
                });
            }

            conditions.push("p.prep_type = ?");
            values.push(prep_type);
        }

        if (difficulty) {
            if (!allowedDifficulties.includes(difficulty)) {
                return res.status(400).json({
                    message: "Invalid difficulty filter."
                });
            }

            conditions.push("p.difficulty = ?");
            values.push(difficulty);
        }

        if (subject_id !== undefined && subject_id !== "") {
            const parsedSubjectId = Number(subject_id);

            if (
                !Number.isInteger(parsedSubjectId) ||
                parsedSubjectId <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid subject ID filter."
                });
            }

            conditions.push("p.subject_id = ?");
            values.push(parsedSubjectId);
        }

        if (search && search.trim()) {
            conditions.push(
                "(p.title LIKE ? OR p.description LIKE ? OR p.content LIKE ?)"
            );

            const searchTerm = `%${search.trim()}%`;
            values.push(searchTerm, searchTerm, searchTerm);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const orderBy =
            sort === "oldest"
                ? "p.created_at ASC"
                : "p.created_at DESC";

        const [posts] = await db.query(
            `SELECT
                p.id,
                p.student_id,
                p.subject_id,
                p.title,
                p.description,
                p.prep_type,
                p.content,
                p.difficulty,
                p.created_at,
                p.updated_at,
                s.name AS subject_name,
                u.name AS student_name
            FROM student_interview_prep p
            LEFT JOIN subjects s ON s.id = p.subject_id
            LEFT JOIN users u ON u.id = p.student_id
            ${whereClause}
            ORDER BY ${orderBy}`,
            values
        );

        return res.status(200).json(posts);
    } catch (error) {
        console.error("Get interview prep posts error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview preparation posts."
        });
    }
};

// ==========================================
// GET MY INTERVIEW PREPARATION POSTS
// ==========================================
const getMyInterviewPrep = async (req, res) => {
    try {
        const [posts] = await db.query(
            `SELECT
                p.id,
                p.student_id,
                p.subject_id,
                p.title,
                p.description,
                p.prep_type,
                p.content,
                p.difficulty,
                p.created_at,
                p.updated_at,
                s.name AS subject_name
            FROM student_interview_prep p
            LEFT JOIN subjects s ON s.id = p.subject_id
            WHERE p.student_id = ?
            ORDER BY p.created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json(posts);
    } catch (error) {
        console.error("Get my interview prep posts error:", error);

        return res.status(500).json({
            message: "Failed to fetch your interview preparation posts."
        });
    }
};

// ==========================================
// GET SINGLE INTERVIEW PREPARATION POST
// ==========================================
const getInterviewPrepById = async (req, res) => {
    try {
        const postId = Number(req.params.id);

        if (!Number.isInteger(postId) || postId <= 0) {
            return res.status(400).json({
                message: "Invalid interview preparation post ID."
            });
        }

        const [posts] = await db.query(
            `SELECT
                p.id,
                p.student_id,
                p.subject_id,
                p.title,
                p.description,
                p.prep_type,
                p.content,
                p.difficulty,
                p.created_at,
                p.updated_at,
                s.name AS subject_name,
                u.name AS student_name
            FROM student_interview_prep p
            LEFT JOIN subjects s ON s.id = p.subject_id
            LEFT JOIN users u ON u.id = p.student_id
            WHERE p.id = ?`,
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                message: "Interview preparation post not found."
            });
        }

        return res.status(200).json(posts[0]);
    } catch (error) {
        console.error("Get interview prep post error:", error);

        return res.status(500).json({
            message: "Failed to fetch interview preparation post."
        });
    }
};

// ==========================================
// UPDATE INTERVIEW PREPARATION POST
// ==========================================
const updateInterviewPrep = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can update interview preparation posts."
            });
        }

        const postId = Number(req.params.id);

        if (!Number.isInteger(postId) || postId <= 0) {
            return res.status(400).json({
                message: "Invalid interview preparation post ID."
            });
        }

        const [existingPosts] = await db.query(
            `SELECT id, student_id
            FROM student_interview_prep
            WHERE id = ?`,
            [postId]
        );

        if (existingPosts.length === 0) {
            return res.status(404).json({
                message: "Interview preparation post not found."
            });
        }

        if (existingPosts[0].student_id !== req.user.id) {
            return res.status(403).json({
                message: "You can only update your own posts."
            });
        }

        const {
            subject_id,
            title,
            description,
            prep_type,
            content,
            difficulty
        } = req.body;

        const allowedTypes = [
            "technical_question",
            "coding_challenge",
            "hr_question",
            "interview_experience",
            "preparation_tip"
        ];

        const allowedDifficulties = [
            "beginner",
            "intermediate",
            "advanced"
        ];

        if (
            !title?.trim() ||
            !content?.trim() ||
            !prep_type
        ) {
            return res.status(400).json({
                message: "Title, content, and preparation type are required."
            });
        }

        if (title.trim().length > 200) {
            return res.status(400).json({
                message: "Title cannot exceed 200 characters."
            });
        }

        if (!allowedTypes.includes(prep_type)) {
            return res.status(400).json({
                message: "Invalid interview preparation type."
            });
        }

        if (
            difficulty &&
            !allowedDifficulties.includes(difficulty)
        ) {
            return res.status(400).json({
                message: "Invalid difficulty level."
            });
        }

        const normalizedSubjectId =
            subject_id === "" || subject_id === undefined || subject_id === null
                ? null
                : Number(subject_id);

        if (
            normalizedSubjectId !== null &&
            (!Number.isInteger(normalizedSubjectId) ||
                normalizedSubjectId <= 0)
        ) {
            return res.status(400).json({
                message: "Invalid subject ID."
            });
        }

        if (normalizedSubjectId !== null) {
            const [subjects] = await db.query(
                "SELECT id FROM subjects WHERE id = ?",
                [normalizedSubjectId]
            );

            if (subjects.length === 0) {
                return res.status(404).json({
                    message: "Subject not found."
                });
            }
        }

        await db.query(
            `UPDATE student_interview_prep
            SET
                subject_id = ?,
                title = ?,
                description = ?,
                prep_type = ?,
                content = ?,
                difficulty = ?
            WHERE id = ?`,
            [
                normalizedSubjectId,
                title.trim(),
                description?.trim() || null,
                prep_type,
                content.trim(),
                difficulty || null,
                postId
            ]
        );

        return res.status(200).json({
            message: "Interview preparation post updated successfully."
        });
    } catch (error) {
        console.error("Update interview prep error:", error);

        return res.status(500).json({
            message: "Failed to update interview preparation post."
        });
    }
};

// ==========================================
// DELETE INTERVIEW PREPARATION POST
// ==========================================
const deleteInterviewPrep = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can delete interview preparation posts."
            });
        }

        const postId = Number(req.params.id);

        if (!Number.isInteger(postId) || postId <= 0) {
            return res.status(400).json({
                message: "Invalid interview preparation post ID."
            });
        }

        const [existingPosts] = await db.query(
            `SELECT id, student_id
            FROM student_interview_prep
            WHERE id = ?`,
            [postId]
        );

        if (existingPosts.length === 0) {
            return res.status(404).json({
                message: "Interview preparation post not found."
            });
        }

        if (existingPosts[0].student_id !== req.user.id) {
            return res.status(403).json({
                message: "You can only delete your own posts."
            });
        }

        await db.query(
            "DELETE FROM student_interview_prep WHERE id = ?",
            [postId]
        );

        return res.status(200).json({
            message: "Interview preparation post deleted successfully."
        });
    } catch (error) {
        console.error("Delete interview prep error:", error);

        return res.status(500).json({
            message: "Failed to delete interview preparation post."
        });
    }
};

module.exports = {
    createInterviewPrep,
    getAllInterviewPrep,
    getMyInterviewPrep,
    getInterviewPrepById,
    updateInterviewPrep,
    deleteInterviewPrep
};