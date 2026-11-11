
const db = require("../config/db");

// ==========================================
// GENERATE AND EMIT DAILY QUIZ NOTIFICATIONS
// ==========================================
const generateDailyQuizNotifications = async (io) => {
    try {

        // ----------------------------------
        // CHECK AVAILABLE QUIZZES AND STUDENTS
        // ----------------------------------
        const [candidates] = await db.query(
            `SELECT
                dq.id AS daily_quiz_id,
                dq.title AS quiz_title,
                sp.user_id,
                s.name AS subject_name
             FROM daily_quizzes dq
             INNER JOIN subjects s
                ON s.id = dq.subject_id
             INNER JOIN student_profiles sp
                ON sp.education_year_id = s.education_year_id
             WHERE dq.status = 'published'
                AND s.status = 'active'
                AND dq.quiz_date = DATE(
                    UTC_TIMESTAMP() + INTERVAL 330 MINUTE
                )
                AND dq.scheduled_at <= UTC_TIMESTAMP()
                AND dq.expires_at > UTC_TIMESTAMP()
                AND NOT EXISTS (
                    SELECT 1
                    FROM daily_quiz_attempts a
                    WHERE a.daily_quiz_id = dq.id
                        AND a.student_id = sp.user_id
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM daily_quiz_notifications n
                    WHERE n.daily_quiz_id = dq.id
                        AND n.user_id = sp.user_id
                        AND n.notification_type = 'new_quiz'
                )`
        );

        let createdCount = 0;

        // ----------------------------------
        // CREATE AND EMIT NOTIFICATIONS
        // ----------------------------------
        for (const candidate of candidates) {

            const title = `New Daily Quiz: ${candidate.quiz_title}`;

            const message =
                `A new daily quiz is available in ${candidate.subject_name}. Complete it before it expires.`;

            // Save notification first.
            // Unique key prevents duplicate notifications.
            const [result] = await db.query(
                `INSERT IGNORE INTO daily_quiz_notifications (
                    daily_quiz_id,
                    user_id,
                    notification_type,
                    title,
                    message,
                    is_read,
                    created_at
                ) VALUES (?, ?, 'new_quiz', ?, ?, 0, UTC_TIMESTAMP())`,
                [
                    candidate.daily_quiz_id,
                    candidate.user_id,
                    title,
                    message
                ]
            );

            // Emit only if a new notification was inserted.
            if (result.affectedRows === 1) {

                createdCount++;

                const notification = {
                    id: result.insertId,
                    daily_quiz_id: candidate.daily_quiz_id,
                    user_id: candidate.user_id,
                    notification_type: "new_quiz",
                    title,
                    message,
                    is_read: false,
                    created_at: new Date().toISOString()
                };

                if (io) {
                    io.to(`student_${candidate.user_id}`).emit(
                        "notification:new",
                        notification
                    );
                }
            }
        }

        if (createdCount > 0) {
            console.log(
                `${createdCount} daily quiz notifications created`
            );
        }

    } catch (error) {
        console.error(
            "Daily quiz notification job error:",
            error
        );
    }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
    generateDailyQuizNotifications
};
