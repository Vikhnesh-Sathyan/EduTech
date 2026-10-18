const db = require("../../../config/db");

// ==========================================
// VOTE ON A CODING QUESTION
// ==========================================

const voteCodePost = async (req, res) => {
    try {
        const postId = Number(req.params.postId);

if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({
        message: "Invalid coding question ID."
    });
}
        const { vote_type } = req.body;

        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can vote on coding questions."
            });
        }

        if (!["helpful", "not_helpful"].includes(vote_type)) {
            return res.status(400).json({
                message: "vote_type must be 'helpful' or 'not_helpful'."
            });
        }

        const [posts] = await db.query(
            `SELECT p.id
             FROM student_code_posts p
             INNER JOIN subjects s ON s.id = p.subject_id
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

const [existingVotes] = await db.query(
    `SELECT id, vote_type
     FROM student_code_votes
     WHERE student_id = ? AND post_id = ?`,
    [req.user.id, postId]
);

if (existingVotes.length > 0) {
    const existingVote = existingVotes[0];

    if (existingVote.vote_type === vote_type) {
        await db.query(
            `DELETE FROM student_code_votes WHERE id = ?`,
            [existingVote.id]
        );

        return res.status(200).json({
            message: "Your vote has been removed.",
            vote_type: null
        });
    }

    await db.query(
        `UPDATE student_code_votes
         SET vote_type = ?
         WHERE id = ?`,
        [vote_type, existingVote.id]
    );

    return res.status(200).json({
        message: "Your vote has been updated.",
        vote_type
    });
}



        await db.query(
            `INSERT INTO student_code_votes
                (student_id, post_id, vote_type)
             VALUES (?, ?, ?)`,
            [req.user.id, postId, vote_type]
        );

        return res.status(201).json({
            message: "Your vote has been recorded.",
            vote_type
        });
    } catch (error) {
        console.error("Vote on code post error:", error);

        return res.status(500).json({
            message: "Failed to record your vote."
        });
    }
};

// ==========================================
// GET CODING QUESTION VOTE COUNTS
// ==========================================

const getCodePostVotes = async (req, res) => {
    try {
        const postId = Number(req.params.postId);

if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({
        message: "Invalid coding question ID."
    });
}

        const [posts] = await db.query(
            `SELECT p.id
             FROM student_code_posts p
             INNER JOIN subjects s ON s.id = p.subject_id
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

        const [counts] = await db.query(
            `SELECT
                COUNT(CASE WHEN vote_type = 'helpful' THEN 1 END)
                    AS helpful_count,
                COUNT(CASE WHEN vote_type = 'not_helpful' THEN 1 END)
                    AS not_helpful_count
             FROM student_code_votes
             WHERE post_id = ?`,
            [postId]
        );

        let myVote = null;

        if (req.user.role === "student") {
            const [myVotes] = await db.query(
                `SELECT vote_type
                 FROM student_code_votes
                 WHERE post_id = ? AND student_id = ?`,
                [postId, req.user.id]
            );

            if (myVotes.length > 0) {
                myVote = myVotes[0].vote_type;
            }
        }

        return res.status(200).json({
            message: "Vote counts retrieved successfully.",
            post_id: Number(postId),
            helpful_count: Number(counts[0].helpful_count),
            not_helpful_count: Number(counts[0].not_helpful_count),
            my_vote: myVote
        });
    } catch (error) {
        console.error("Get code post votes error:", error);

        return res.status(500).json({
            message: "Failed to retrieve vote counts."
        });
    }
};


module.exports = {
    voteCodePost,
    getCodePostVotes
};
