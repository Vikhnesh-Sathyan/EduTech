
const db = require("../../../config/db");

// ==========================================
// GET STUDENT DAILY QUIZ STREAK
// ==========================================
const getDailyQuizStreak = async (req, res) => {
    try {
        const studentId = req.user.id;

        // ----------------------------------
        // FETCH DISTINCT PARTICIPATION DATES
        // ----------------------------------
        const [rows] = await db.query(
            `SELECT DISTINCT
                DATE_FORMAT(dq.quiz_date, '%Y-%m-%d') AS participation_date
             FROM daily_quiz_attempts a
             INNER JOIN daily_quizzes dq
                ON dq.id = a.daily_quiz_id
             WHERE a.student_id = ?
                AND dq.quiz_date <= DATE(
                    UTC_TIMESTAMP() + INTERVAL 330 MINUTE
                )
             ORDER BY participation_date DESC`,
            [studentId]
        );

        // ----------------------------------
        // PREPARE DATE SET
        // ----------------------------------
        const participationDates = new Set(
            rows.map(row => row.participation_date)
        );

        const datesAscending = Array.from(participationDates).sort();

        // ----------------------------------
        // GET CURRENT IST DATE
        // ----------------------------------
        const [dateRows] = await db.query(
            `SELECT DATE_FORMAT(
                DATE(UTC_TIMESTAMP() + INTERVAL 330 MINUTE),
                '%Y-%m-%d'
            ) AS today`
        );

        const today = dateRows[0].today;

        const toDateNumber = dateString => {
            const [year, month, day] = dateString
                .split("-")
                .map(Number);

            return Date.UTC(year, month - 1, day);
        };

        const addDays = (dateString, days) => {
            const date = new Date(
                toDateNumber(dateString) + days * 86400000
            );

            return date.toISOString().slice(0, 10);
        };

        // ----------------------------------
        // CHECK TODAY'S PARTICIPATION
        // ----------------------------------
        const completedToday = participationDates.has(today);

        // ----------------------------------
        // CALCULATE CURRENT STREAK
        // ----------------------------------
        const yesterday = addDays(today, -1);

        let currentStreak = 0;

        let streakDate = completedToday
            ? today
            : yesterday;

        if (participationDates.has(streakDate)) {
            while (participationDates.has(streakDate)) {
                currentStreak++;

                streakDate = addDays(streakDate, -1);
            }
        }

        // ----------------------------------
        // CALCULATE LONGEST STREAK
        // ----------------------------------
        let longestStreak = 0;
        let runningStreak = 0;
        let previousDate = null;

        for (const date of datesAscending) {
            if (
                previousDate &&
                toDateNumber(date) - toDateNumber(previousDate)
                    === 86400000
            ) {
                runningStreak++;
            } else {
                runningStreak = 1;
            }

            longestStreak = Math.max(
                longestStreak,
                runningStreak
            );

            previousDate = date;
        }

        // ----------------------------------
        // RETURN STREAK SUMMARY
        // ----------------------------------
        return res.status(200).json({
            success: true,
            message: "Daily quiz streak fetched successfully",
            streak: {
                current_streak: currentStreak,
                longest_streak: longestStreak,
                total_active_days: participationDates.size,
                completed_today: completedToday,
                last_activity_date: datesAscending.length
                    ? datesAscending[datesAscending.length - 1]
                    : null
            }
        });

    } catch (error) {
        console.error("Get daily quiz streak error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch daily quiz streak"
        });
    }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
    getDailyQuizStreak
};
