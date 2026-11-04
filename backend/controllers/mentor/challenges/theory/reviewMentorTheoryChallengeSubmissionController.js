
const db = require("../../../../config/db");

// ==========================================
// REVIEW MENTOR THEORY CHALLENGE SUBMISSION
// ==========================================

const reviewMentorTheoryChallengeSubmission = async (req, res) => {

    let connection;

    try {

        const mentorId = req.user.id;
        const { attemptId } = req.params;

        const {
            criteria,
            feedback
        } = req.body;

        // ==========================================
        // VALIDATE INPUT
        // ==========================================

        if (!attemptId || !Number.isInteger(Number(attemptId)) || Number(attemptId) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid attempt ID is required"
            });
        }

        if (
            !criteria ||
            typeof criteria !== "object" ||
            Array.isArray(criteria) ||
            Object.keys(criteria).length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Evaluation criteria are required"
            });
        }

        if (
            !feedback ||
            typeof feedback !== "string" ||
            !feedback.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Feedback is required"
            });
        }

        // ==========================================
        // START DATABASE TRANSACTION
        // ==========================================

        connection = await db.getConnection();

        await connection.beginTransaction();

        // ==========================================
        // GET SUBMISSION AND LOCK IT
        // ==========================================

        const [attempts] = await connection.query(
            `
            SELECT
                tca.id,
                tca.challenge_id,
                tca.student_id,
                tca.result_status,

                tc.created_by,
                tct.type_key

            FROM theory_challenge_attempts tca

            INNER JOIN theory_challenges tc
                ON tc.id = tca.challenge_id

            INNER JOIN theory_challenge_types tct
                ON tct.id = tc.challenge_type_id

            WHERE tca.id = ?
              AND tc.created_by = ?

            FOR UPDATE
            `,
            [attemptId, mentorId]
        );

        // ==========================================
        // CHECK SUBMISSION EXISTS
        // ==========================================

        if (attempts.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Submission not found or access denied"
            });

        }

        const attempt = attempts[0];

        // ==========================================
        // CHECK PENDING STATUS
        // ==========================================

        if (attempt.result_status !== "pending") {

            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "This submission has already been reviewed"
            });

        }

        // ==========================================
// VALIDATE EVALUATION CRITERIA
// ==========================================

const allowedCriteria = [
    "concept_understanding",
    "clarity_of_explanation",
    "examples_reasoning",
    "technical_accuracy"
];

let totalScore = 0;
let totalMaxScore = 0;
let selectedCount = 0;

for (const key of Object.keys(criteria)) {

    if (!allowedCriteria.includes(key)) {
        await connection.rollback();

        return res.status(400).json({
            success: false,
            message: `Invalid evaluation criterion: ${key}`
        });
    }

    const item = criteria[key];

    if (
        !item ||
        typeof item !== "object" ||
        typeof item.selected !== "boolean"
    ) {
        await connection.rollback();

        return res.status(400).json({
            success: false,
            message: `Invalid selection for ${key}`
        });
    }

    // Ignore criteria not selected by mentor
    if (!item.selected) {
        continue;
    }

    const score = Number(item.score);
    const maxScore = Number(item.max_score);

    if (
        !Number.isFinite(score) ||
        !Number.isFinite(maxScore) ||
        maxScore <= 0 ||
        score < 0 ||
        score > maxScore
    ) {
        await connection.rollback();

        return res.status(400).json({
            success: false,
            message: `Invalid marks for ${key}`
        });
    }

    totalScore += score;
    totalMaxScore += maxScore;
    selectedCount++;
}

// ==========================================
// CHECK SELECTED CRITERIA
// ==========================================

if (selectedCount === 0 || Math.abs(totalMaxScore - 10) > 0.001) {

    await connection.rollback();

    return res.status(400).json({
        success: false,
        message: "Select relevant criteria with a combined maximum of 10 marks"
    });

}

// ==========================================
// CALCULATE FINAL SCORE
// ==========================================

const finalScore = Number(totalScore.toFixed(2));

// ==========================================
// DETERMINE SUBMISSION STATUS
// ==========================================

const resultStatus =
    finalScore === 10
        ? "completed"
        : "reviewed";

// ==========================================
// SAVE MENTOR REVIEW
// ==========================================

const [updateResult] = await connection.query(
    `
    UPDATE theory_challenge_attempts

    SET
        score = ?,
        evaluation_details = ?,
        feedback = ?,
        result_status = ?,
        reviewed_by = ?,
        reviewed_at = NOW()

    WHERE id = ?
      AND result_status = 'pending'
    `,
    [
        finalScore,
        JSON.stringify(criteria),
        feedback.trim(),
        resultStatus,
        mentorId,
        attemptId
    ]
);

// ==========================================
// CHECK UPDATE
// ==========================================

if (updateResult.affectedRows !== 1) {

    await connection.rollback();

    return res.status(409).json({
        success: false,
        message: "Unable to review this submission"
    });

}

// ==========================================
// COMMIT TRANSACTION
// ==========================================

await connection.commit();

// ==========================================
// SEND RESPONSE
// ==========================================

return res.status(200).json({
    success: true,
    message: resultStatus === "completed"
        ? "Excellent! Challenge completed successfully."
        : "Submission reviewed successfully. Student can try again.",

    review: {
        attempt_id: Number(attemptId),
        challenge_id: attempt.challenge_id,
        student_id: attempt.student_id,
        score: finalScore,
        evaluation_details: criteria,
        feedback: feedback.trim(),
        result_status: resultStatus,
        reviewed_by: mentorId
    }
});

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Mentor Theory Challenge Review Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to review Theory Challenge submission"
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }
};

module.exports = {
    reviewMentorTheoryChallengeSubmission
};
