
const db = require("../../../config/db");

// =====================================================
// GET DAILY QUIZ ACTIVITY
// =====================================================

const getDailyQuizActivity = async (req, res) => {

    try {

        const studentId = req.user.id;

        // -------------------------------------------------
        // GET ALL COMPLETED QUIZ ATTEMPTS
        // -------------------------------------------------

        const [attempts] = await db.execute(
            `SELECT
                dq.quiz_date,
                a.total_questions,
                a.correct_answers,
                a.wrong_answers,
                a.score,
                a.submitted_at

             FROM daily_quiz_attempts a

             INNER JOIN daily_quizzes dq
                ON dq.id = a.daily_quiz_id

             WHERE a.student_id = ?

             ORDER BY dq.quiz_date ASC`,
            [studentId]
        );

        // -------------------------------------------------
        // GET INDIA CURRENT DATE
        // -------------------------------------------------

        const indiaDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(new Date());

        // -------------------------------------------------
        // BUILD ACTIVITY CALENDAR
        // -------------------------------------------------

        const activityMap = new Map();

        attempts.forEach(attempt => {

            const date = new Date(attempt.quiz_date)
                .toISOString()
                .split("T")[0];

            activityMap.set(date, {
                date,
                score: attempt.score,
                total_questions: attempt.total_questions,
                correct_answers: attempt.correct_answers,
                wrong_answers: attempt.wrong_answers,
                submitted_at: attempt.submitted_at
            });
        });

        const activity = Array.from(
            activityMap.values()
        );

        // -------------------------------------------------
        // CALCULATE TOTAL STATISTICS
        // -------------------------------------------------

        const totalCompleted = attempts.length;

        const totalCorrect = attempts.reduce(
            (sum, attempt) => sum + attempt.correct_answers,
            0
        );

        const totalScore = attempts.reduce(
            (sum, attempt) => sum + attempt.score,
            0
        );

        const averageScore = totalCompleted > 0
            ? Number((totalScore / totalCompleted).toFixed(2))
            : 0;

        // -------------------------------------------------
        // CALCULATE STREAKS
        // -------------------------------------------------

        const completedDates = new Set(
            activity.map(item => item.date)
        );

        const sortedDates = Array.from(
            completedDates
        ).sort();

        let longestStreak = 0;
        let currentRun = 0;
        let previousDate = null;

        for (const date of sortedDates) {

            const currentDate = new Date(`${date}T00:00:00Z`);

            if (previousDate) {

                const difference = Math.round(
                    (currentDate - previousDate) / 86400000
                );

                currentRun = difference === 1
                    ? currentRun + 1
                    : 1;

            } else {
                currentRun = 1;
            }

            longestStreak = Math.max(
                longestStreak,
                currentRun
            );

            previousDate = currentDate;
        }

        // -------------------------------------------------
        // CALCULATE CURRENT STREAK
        // -------------------------------------------------

        let currentStreak = 0;

        const today = new Date(`${indiaDate}T00:00:00Z`);

        const yesterday = new Date(today);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);

        let streakDate = completedDates.has(indiaDate)
            ? today
            : yesterday;

        while (completedDates.has(
            streakDate.toISOString().split("T")[0]
        )) {

            currentStreak++;

            streakDate.setUTCDate(
                streakDate.getUTCDate() - 1
            );
        }

        // -------------------------------------------------
        // RETURN ACTIVITY
        // -------------------------------------------------

        return res.status(200).json({
            success: true,

            statistics: {
                total_completed: totalCompleted,
                current_streak: currentStreak,
                longest_streak: longestStreak,
                average_score: averageScore,
                total_correct_answers: totalCorrect
            },

            activity
        });

    } catch (error) {

        console.error("Daily Quiz Activity Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve daily quiz activity."
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getDailyQuizActivity
};

//git hub based style