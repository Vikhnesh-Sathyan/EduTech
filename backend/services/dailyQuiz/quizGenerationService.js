
const db = require("../../config/db");

// ==========================================
// GENERATE ONE GLOBAL DAILY QUIZ
// ==========================================

const generateDailyQuiz = async (quizDate, currentTime, publishedAt) => {
    
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Check whether today's global quiz already exists.
        const [existingQuizzes] = await connection.execute(
            `SELECT id
             FROM daily_quizzes
             WHERE quiz_date = ?
             LIMIT 1
             FOR UPDATE`,
            [quizDate]
        );

        if (existingQuizzes.length > 0) {
            await connection.rollback();

            return {
                success: true,
                generated: false,
                reason: "Today's quiz already exists"
            };
        }

        // 2. Find one eligible subject.
        // A subject must:
        // - Have active automation settings.
        // - Have an active subject.
        // - Have reached its configured publishing time.
        // - Have at least three eligible unused questions.

const [subjects] = await connection.execute(
    `SELECT
        settings.subject_id,
        settings.created_by,
        settings.publish_time,
        COUNT(qb.id) AS available_questions

     FROM daily_quiz_automation_settings settings

     INNER JOIN subjects s
        ON s.id = settings.subject_id

     INNER JOIN education_years ey
        ON ey.id = s.education_year_id

     INNER JOIN departments d
        ON d.id = ey.department_id

     INNER JOIN education_programs ep
        ON ep.id = d.education_program_id

     INNER JOIN question_bank_questions qb
        ON qb.subject_id = settings.subject_id
        AND qb.status = 'active'

     WHERE settings.status = 'active'
       AND s.status = 'active'
       AND ey.status = 'active'
       AND d.status = 'active'
       AND ep.status = 'active'
       AND settings.publish_time <= ?

       AND NOT EXISTS (
           SELECT 1
           FROM daily_quiz_questions dqq
           WHERE dqq.source_question_id = qb.id
       )

       AND (
           SELECT COUNT(*)
           FROM question_bank_options qbo
           WHERE qbo.question_id = qb.id
       ) = 3

       AND (
           SELECT COUNT(*)
           FROM question_bank_options qbo
           WHERE qbo.question_id = qb.id
             AND qbo.is_correct = 1
       ) = 1

     GROUP BY
        settings.subject_id,
        settings.created_by

     HAVING COUNT(qb.id) >= 3

     ORDER BY RAND()
     LIMIT 1`,
    [currentTime]
);


        // No subject has enough eligible questions.
        if (subjects.length === 0) {
            await connection.rollback();

            return {
                success: true,
                generated: false,
                reason: "No subject has at least three eligible questions"
            };
        }

        const selectedSubject = subjects[0];

        const subjectId = selectedSubject.subject_id;
        const adminId = selectedSubject.created_by;

        // 3. Lock and select exactly three unused questions.
        const [questions] = await connection.execute(
            `SELECT qb.id, qb.question_text

             FROM question_bank_questions qb

             WHERE qb.subject_id = ?
               AND qb.status = 'active'

               AND NOT EXISTS (
                   SELECT 1
                   FROM daily_quiz_questions dqq
                   WHERE dqq.source_question_id = qb.id
               )

               AND (
                   SELECT COUNT(*)
                   FROM question_bank_options qbo
                   WHERE qbo.question_id = qb.id
               ) = 3

               AND (
                   SELECT COUNT(*)
                   FROM question_bank_options qbo
                   WHERE qbo.question_id = qb.id
                     AND qbo.is_correct = 1
               ) = 1

             ORDER BY RAND()
             LIMIT 3
             FOR UPDATE`,
            [subjectId]
        );

        if (questions.length !== 3) {
            await connection.rollback();

            return {
                success: true,
                generated: false,
                reason: "Insufficient unused questions"
            };
        }

        // 4. Create the single published daily quiz.
     const [quizResult] = await connection.execute(
    `INSERT INTO daily_quizzes (
        subject_id,
        created_by,
        title,
        instructions,
        quiz_date,
        publish_time,
        scheduled_at,
        expires_at,
        status
    )
    VALUES (
        ?,
        ?,
        'Daily Quiz',
        'Answer all three questions within 24 hours of publication.',
        ?,
        ?,
        ?,
        DATE_ADD(?, INTERVAL 24 HOUR),
        'published'
    )`,
    [
        subjectId,
        adminId,
        quizDate,
        selectedSubject.publish_time,
        publishedAt,
        publishedAt
    ]
);

        const quizId = quizResult.insertId;

        // 5. Copy questions and options into the quiz snapshot.
        for (let index = 0; index < questions.length; index++) {
            const question = questions[index];

            const [questionResult] = await connection.execute(
                `INSERT INTO daily_quiz_questions (
                    daily_quiz_id,
                    question_text,
                    question_order,
                    source_question_id
                )
                VALUES (?, ?, ?, ?)`,
                [
                    quizId,
                    question.question_text,
                    index + 1,
                    question.id
                ]
            );

            const dailyQuestionId = questionResult.insertId;

            const [options] = await connection.execute(
                `SELECT option_text, is_correct, option_order
                 FROM question_bank_options
                 WHERE question_id = ?
                 ORDER BY option_order`,
                [question.id]
            );

            if (
                options.length !== 3 ||
                options.filter(option => option.is_correct === 1).length !== 1
            ) {
                throw new Error(
                    `Question ${question.id} has invalid options`
                );
            }

            for (const option of options) {
                await connection.execute(
                    `INSERT INTO daily_quiz_options (
                        question_id,
                        option_text,
                        is_correct,
                        option_order
                    )
                    VALUES (?, ?, ?, ?)`,
                    [
                        dailyQuestionId,
                        option.option_text,
                        option.is_correct,
                        option.option_order
                    ]
                );
            }
        }

        await connection.commit();

        return {
            success: true,
            generated: true,
            quizId,
            subjectId,
            questionCount: 3
        };

    } catch (error) {
        await connection.rollback();

        // Another scheduler instance may have generated
        // today's quiz at the same time.
        if (error.code === "ER_DUP_ENTRY") {
            return {
                success: true,
                generated: false,
                reason: "Today's quiz already exists"
            };
        }

        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    generateDailyQuiz
};
