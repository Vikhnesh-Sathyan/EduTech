const db = require("../../../config/db");

// ==========================================
// CREATE CODING QUESTION
// ==========================================


const createCodePost = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can create coding questions."
            });
        }

        const {
            subject_id,
            title,
            problem_statement,
            description,
            difficulty,
            search_keywords
        } = req.body;

        const allowedDifficulties = [
            "beginner",
            "intermediate",
            "advanced"
        ];

        // Validate required fields
        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof problem_statement !== "string" ||
            !problem_statement.trim()
        ) {
            return res.status(400).json({
                message: "Question title and problem statement are required."
            });
        }

        // Validate title length
        if (title.trim().length > 200) {
            return res.status(400).json({
                message: "Title cannot exceed 200 characters."
            });
        }

        // Validate optional text fields
        if (
            description != null &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                message: "Description must be text."
            });
        }

        if (
            search_keywords != null &&
            typeof search_keywords !== "string"
        ) {
            return res.status(400).json({
                message: "Search keywords must be text."
            });
        }

        if (description?.trim().length > 10000) {
            return res.status(400).json({
                message: "Description cannot exceed 10000 characters."
            });
        }

        if (search_keywords?.trim().length > 500) {
            return res.status(400).json({
                message: "Search keywords cannot exceed 500 characters."
            });
        }

        // Validate difficulty
        if (
            difficulty != null &&
            !allowedDifficulties.includes(difficulty)
        ) {
            return res.status(400).json({
                message: "Invalid difficulty level."
            });
        }

        // Validate subject ID
        const normalizedSubjectId = Number(subject_id);

        if (
            !Number.isInteger(normalizedSubjectId) ||
            normalizedSubjectId <= 0
        ) {
            return res.status(400).json({
                message: "A valid subject is required."
            });
        }

        // Ensure the subject exists and is active
        const [subjects] = await db.query(
            `SELECT id
             FROM subjects
             WHERE id = ? AND status = 'active'`,
            [normalizedSubjectId]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                message: "Active subject not found."
            });
        }

        // Create the coding question
        const [result] = await db.query(
            `INSERT INTO student_code_posts
            (
                student_id,
                subject_id,
                title,
                problem_statement,
                description,
                difficulty,
                search_keywords
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                normalizedSubjectId,
                title.trim(),
                problem_statement.trim(),
                description?.trim() || null,
                difficulty || "beginner",
                search_keywords?.trim() || null
            ]
        );

        return res.status(201).json({
            message: "Coding question created successfully.",
            id: result.insertId
        });
    } catch (error) {
        console.error("Create coding question error:", error);

        return res.status(500).json({
            message: "Failed to create coding question."
        });
    }
};


// ==========================================
// GET PUBLISHED CODING QUESTIONS
// Search by question and filter by subject
// ==========================================

const getAllCodePosts = async (req, res) => {
    try {
        const { search, subject_id, difficulty } = req.query;

        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 20);

        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            return res.status(400).json({
                message: "Page must be positive and limit must be between 1 and 100."
            });
        }

        if (
            search !== undefined &&
            (
                typeof search !== "string" ||
                search.trim().length > 200
            )
        ) {
            return res.status(400).json({
                message: "Search must be text and cannot exceed 200 characters."
            });
        }

        const conditions = [
            "p.status = 'published'",
            "s.status = 'active'"
        ];

        const values = [];

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

        if (difficulty !== undefined && difficulty !== "") {
            const allowedDifficulties = [
                "beginner",
                "intermediate",
                "advanced"
            ];

            if (!allowedDifficulties.includes(difficulty)) {
                return res.status(400).json({
                    message: "Invalid difficulty filter."
                });
            }

            conditions.push("p.difficulty = ?");
            values.push(difficulty);
        }

        const term = typeof search === "string" ? search.trim() : "";
if (term) {
    conditions.push(`
        (
            p.title LIKE ?
            OR p.problem_statement LIKE ?
            OR p.description LIKE ?
            OR p.search_keywords LIKE ?
        )
    `);

    const pattern = `%${term}%`;

    values.push(
        pattern,
        pattern,
        pattern,
        pattern
    );
}

        const whereClause = conditions.join(" AND ");

        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total
             FROM student_code_posts p
             INNER JOIN subjects s ON s.id = p.subject_id
             WHERE ${whereClause}`,
            values
        );

        const offset = (page - 1) * limit;

        const [posts] = await db.query(
            `SELECT
                p.id,
                p.subject_id,
                p.title,
                p.problem_statement,
                p.description,
                p.difficulty,
                p.search_keywords,
                p.created_at,
                p.updated_at,
                s.name AS subject_name,
                u.name AS student_name
             FROM student_code_posts p
             INNER JOIN subjects s ON s.id = p.subject_id
             INNER JOIN users u ON u.id = p.student_id
             WHERE ${whereClause}
             ORDER BY p.created_at DESC, p.id DESC
             LIMIT ? OFFSET ?`,
            [...values, limit, offset]
        );

        const total = Number(countRows[0].total);

        return res.status(200).json({
            questions: posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get coding questions error:", error);

        return res.status(500).json({
            message: "Failed to fetch coding questions."
        });
    }
};

const getCodePostById = async (req, res) => {
    try {
        const postId = Number(req.params.id);

        if (!Number.isInteger(postId) || postId <= 0) {
            return res.status(400).json({
                message: "Invalid coding question ID."
            });
        }

        const [posts] = await db.query(
            `SELECT
                p.id,
                p.subject_id,
                p.title,
                p.problem_statement,
                p.description,
                p.difficulty,
                p.search_keywords,
                p.created_at,
                p.updated_at,
                s.name AS subject_name,
                u.name AS student_name
             FROM student_code_posts p
             INNER JOIN subjects s ON s.id = p.subject_id
             INNER JOIN users u ON u.id = p.student_id
             WHERE p.id = ?
               AND p.status = 'published'
               AND s.status = 'active'`,
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({
                message: "Coding question not found."
            });
        }

        const [solutions] = await db.query(
            `SELECT
                id,
                solution_title,
                programming_language,
                code,
                algorithm_explanation,
                time_complexity,
                space_complexity,
                version,
                created_at,
                updated_at
             FROM student_code_solutions
             WHERE post_id = ?
             ORDER BY created_at ASC`,
            [postId]
        );

        return res.status(200).json({
            ...posts[0],
            solutions
        });
    } catch (error) {
        console.error("Get coding question details error:", error);

        return res.status(500).json({
            message: "Failed to fetch coding question details."
        });
    }
};

module.exports = {
    createCodePost,
    getAllCodePosts,
    getCodePostById
};
