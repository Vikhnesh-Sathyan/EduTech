
const db = require("../../../../config/db");

// ==========================================
// SUBMIT THEORY CHALLENGE ATTEMPT
// ==========================================

const submitTheoryChallengeAttempt = async (req, res) => {

    let connection;

    try {

        const studentId = req.user.id;
        const challengeId = req.params.challengeId;
        const { submitted_content } = req.body;

        // Validate submitted content
        if (
            !submitted_content ||
            typeof submitted_content !== "object" ||
            Array.isArray(submitted_content)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid submitted content is required"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // ==========================================
        // CHECK CHALLENGE ACCESS AND LOCK CHALLENGE
        // ==========================================

        const [challenges] = await connection.query(
            `
            SELECT
                tc.id,
                tc.created_by,
                creator.role AS creator_role

            FROM theory_challenges tc

            INNER JOIN users creator
                ON creator.id = tc.created_by

            WHERE tc.id = ?
              AND tc.status = 'published'
              AND creator.status = 'active'

              AND (
                    creator.role = 'admin'

                    OR

                    (
                        creator.role = 'mentor'

                        AND EXISTS (
                            SELECT 1

                            FROM mentor_student_relationships msr

                            WHERE msr.mentor_id = tc.created_by
                              AND msr.student_id = ?
                              AND msr.status = 'accepted'
                              AND msr.is_active = TRUE
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
                message: "Theory Challenge not found or access denied"
            });

        }

        // ==========================================
        // CHECK EXISTING ATTEMPTS
        // ==========================================

        const [attempts] = await connection.query(
            `
            SELECT
                id,
                attempt_number,
                result_status

            FROM theory_challenge_attempts

            WHERE challenge_id = ?
              AND student_id = ?

            ORDER BY attempt_number DESC

            FOR UPDATE
            `,
            [challengeId, studentId]
        );

        if (
            attempts.length > 0 &&
            attempts[0].result_status === "pending"
        ) {

            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Your previous submission is waiting for mentor review"
            });

        }

        if (
            attempts.length > 0 &&
            attempts[0].result_status === "completed"
        ) {

            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "This challenge is already completed"
            });

        }

        // ==========================================
        // GENERATE NEXT ATTEMPT NUMBER
        // ==========================================

        const nextAttemptNumber =
            attempts.length > 0
                ? attempts[0].attempt_number + 1
                : 1;

        // ==========================================
        // SAVE SUBMISSION
        // ==========================================

        const [result] = await connection.query(
            `
            INSERT INTO theory_challenge_attempts
            (
                challenge_id,
                student_id,
                attempt_number,
                submitted_content,
                result_status
            )

            VALUES (?, ?, ?, ?, 'pending')
            `,
            [
                challengeId,
                studentId,
                nextAttemptNumber,
                JSON.stringify(submitted_content)
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Theory Challenge submitted successfully. Waiting for mentor review.",

            attempt: {
                id: result.insertId,
                challenge_id: challengeId,
                attempt_number: nextAttemptNumber,
                result_status: "pending"
            }
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Theory Challenge Submission Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to submit Theory Challenge"
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }
};

module.exports = {
    submitTheoryChallengeAttempt
};
