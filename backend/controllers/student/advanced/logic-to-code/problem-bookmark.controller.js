
// =====================================================
// IMPORT DATABASE
// =====================================================

const db = require("../../../../config/db");


// =====================================================
// ADD PROBLEM BOOKMARK
// =====================================================

const addProblemBookmark = async (req, res) => {

    try {

        const studentId = req.user.id;
        const { problemId } = req.params;

        const parsedProblemId = Number(problemId);

        if (
            !Number.isInteger(parsedProblemId) ||
            parsedProblemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID"
            });
        }

        // Check whether the problem is published

        const [problems] = await db.query(
            `
            SELECT id
            FROM logic_to_code_problems
            WHERE id = ?
            AND status = 'published'
            `,
            [parsedProblemId]
        );

        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Published problem not found"
            });
        }

        // Check existing bookmark

        const [existing] = await db.query(
            `
            SELECT id
            FROM logic_to_code_bookmarks
            WHERE student_id = ?
            AND problem_id = ?
            `,
            [studentId, parsedProblemId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Problem already bookmarked"
            });
        }

        // Insert bookmark

        await db.query(
            `
            INSERT INTO logic_to_code_bookmarks
            (student_id, problem_id)
            VALUES (?, ?)
            `,
            [studentId, parsedProblemId]
        );

        return res.status(201).json({
            success: true,
            message: "Problem bookmarked successfully"
        });

} catch (error) {

    console.error("Add Problem Bookmark Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            success: false,
            message: "Problem already bookmarked"
        });
    }

    return res.status(500).json({
        success: false,
        message: "Failed to bookmark problem"
    });
}

};


// =====================================================
// REMOVE PROBLEM BOOKMARK
// =====================================================

const removeProblemBookmark = async (req, res) => {

    try {

        const studentId = req.user.id;
        const { problemId } = req.params;

        const parsedProblemId = Number(problemId);

        if (
            !Number.isInteger(parsedProblemId) ||
            parsedProblemId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid problem ID"
            });
        }

        const [result] = await db.query(
            `
            DELETE FROM logic_to_code_bookmarks
            WHERE student_id = ?
            AND problem_id = ?
            `,
            [studentId, parsedProblemId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Bookmark not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Bookmark removed successfully"
        });

    } catch (error) {

        console.error("Remove Problem Bookmark Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove bookmark"
        });

    }

};


// =====================================================
// GET STUDENT BOOKMARKED PROBLEMS
// =====================================================

const getBookmarkedProblems = async (req, res) => {

    try {

        const studentId = req.user.id;

        const [problems] = await db.query(
            `
            SELECT
                p.id,
                p.title,
                p.description,
                p.difficulty,
                u.name AS mentor_name,
                b.created_at AS bookmarked_at

            FROM logic_to_code_bookmarks b

            JOIN logic_to_code_problems p
                ON b.problem_id = p.id

            JOIN users u
                ON p.mentor_id = u.id

            WHERE b.student_id = ?
            AND p.status = 'published'

            ORDER BY b.created_at DESC
            `,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            message: "Bookmarked problems fetched successfully",
            data: problems
        });

    } catch (error) {

        console.error("Get Bookmarked Problems Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookmarked problems"
        });

    }

};


// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
    addProblemBookmark,
    removeProblemBookmark,
    getBookmarkedProblems
};
