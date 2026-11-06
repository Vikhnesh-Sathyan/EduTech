
const db = require("../../../../config/db");

// ==========================================
// SUBMIT CODING CHALLENGE ATTEMPT
// ==========================================

const submitCodingChallengeAttempt = async (req, res) => {
    let connection;

    try {

        const studentId = req.user.id;
        const { challengeId } = req.params;
        const { submitted_content } = req.body;

        // Validate submitted content
        if (
            !submitted_content ||
            typeof submitted_content !== "object" ||
            Array.isArray(submitted_content)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid submission content is required"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // Check challenge visibility and lock its row
        const [challenges] = await connection.query(
            `
            SELECT
                cc.id,
                cc.status

            FROM coding_challenges cc

            INNER JOIN users creator
                ON creator.id = cc.created_by

            WHERE cc.id = ?
              AND cc.status = 'published'
              AND creator.status = 'active'

              AND (
                    creator.role = 'admin'

                    OR (
                        creator.role = 'mentor'

                        AND EXISTS (
    SELECT 1

    FROM mentor_student_relationships msr

    INNER JOIN student_profiles sp
        ON sp.user_id = msr.student_id

    INNER JOIN subjects s
        ON s.id = cc.subject_id

    INNER JOIN education_years ey
        ON ey.id = s.education_year_id

    INNER JOIN departments d
        ON d.id = ey.department_id

    INNER JOIN education_programs ep
        ON ep.id = d.education_program_id

    WHERE msr.mentor_id = cc.created_by
      AND msr.student_id = ?
      AND msr.status = 'accepted'
      AND msr.is_active = TRUE

      AND sp.education_program_id = ep.id
      AND sp.department_id = d.id
      AND sp.education_year_id = ey.id
)
                    )
              )

            FOR UPDATE
            `,
            [challengeId, studentId]
        );

        if (challenges.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Coding Challenge not found or not available"
            });

        }

        // Check whether previous attempt is still pending
const [pendingAttempts] = await connection.query(
    `
    SELECT id
    FROM coding_challenge_attempts
    WHERE challenge_id = ?
      AND student_id = ?
      AND result_status IN ('pending', 'running')
    LIMIT 1
    `,
    [challengeId, studentId]
);

if (pendingAttempts.length > 0) {

    await connection.rollback();

    return res.status(409).json({
        success: false,
        message: "Your previous attempt is still waiting for evaluation. Please wait before submitting again."
    });

}

        // Check whether student already completed this challenge
        const [completedAttempts] = await connection.query(
            `
            SELECT id
            FROM coding_challenge_attempts
            WHERE challenge_id = ?
              AND student_id = ?
              AND result_status = 'completed'
            LIMIT 1
            `,
            [challengeId, studentId]
        );

        if (completedAttempts.length > 0) {

            await connection.rollback();

            return res.status(403).json({
                success: false,
                message: "This challenge is already completed. Further attempts are not allowed."
            });

        }

        // Get the next attempt number
        const [attempts] = await connection.query(
            `
            SELECT COALESCE(MAX(attempt_number), 0) + 1
                AS next_attempt_number

            FROM coding_challenge_attempts

            WHERE challenge_id = ?
              AND student_id = ?
            `,
            [challengeId, studentId]
        );

        const attemptNumber = attempts[0].next_attempt_number;

        // Save the submission for evaluation
        const [result] = await connection.query(
            `
            INSERT INTO coding_challenge_attempts
            (
                challenge_id,
                student_id,
                attempt_number,
                submitted_content,
                score,
                result_status,
                feedback
            )

            VALUES (?, ?, ?, ?, NULL, 'pending', NULL)
            `,
            [
                challengeId,
                studentId,
                attemptNumber,
                JSON.stringify(submitted_content)
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Coding Challenge submitted successfully. Evaluation is pending.",
            attemptId: result.insertId,
            attemptNumber,
            evaluationStatus: "pending"
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Coding Challenge Submission Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to submit Coding Challenge"
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }
};

module.exports = {
    submitCodingChallengeAttempt
};
