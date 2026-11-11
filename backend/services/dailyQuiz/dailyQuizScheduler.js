
const cron = require("node-cron");

const {
    generateDailyQuiz
} = require("./quizGenerationService");

let schedulerTask = null;
let isRunning = false;

// ==========================================
// GET CURRENT INDIA DATE AND TIME
// ==========================================


const getIndiaDateTime = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date());

    const values = {};

    parts.forEach(part => {
        values[part.type] = part.value;
    });

    const date = `${values.year}-${values.month}-${values.day}`;
    const time = `${values.hour}:${values.minute}:${values.second}`;

    return {
        date,
        time,
        publishedAt: `${date} ${time}`
    };
};


// ==========================================
// CHECK AND GENERATE ONE GLOBAL DAILY QUIZ
// ==========================================

const checkDailyQuizGeneration = async () => {
    if (isRunning) {
        return;
    }

    isRunning = true;

    try {
        const { date, time, publishedAt } = getIndiaDateTime();

        // Check whether at least one active subject
        // has reached its configured publishing time.

        const db = require("../../config/db");

        const [eligibleSubjects] = await db.execute(
            `SELECT a.subject_id

             FROM daily_quiz_automation_settings a

             INNER JOIN subjects s
                ON a.subject_id = s.id

             INNER JOIN education_years ey
                ON s.education_year_id = ey.id

             INNER JOIN departments d
                ON ey.department_id = d.id

             INNER JOIN education_programs ep
                ON d.education_program_id = ep.id

             WHERE a.status = 'active'
               AND s.status = 'active'
               AND ey.status = 'active'
               AND d.status = 'active'
               AND ep.status = 'active'
               AND a.publish_time <= ?

             LIMIT 1`,
            [time]
        );

        // No configured subject has reached its publishing time.
        if (eligibleSubjects.length === 0) {
            return;
        }

        // Generate only ONE quiz for the entire platform.
        const result = await generateDailyQuiz(date, time, publishedAt);

        if (result.generated) {
            console.log(
                `Daily quiz published successfully. Quiz ID: ${result.quizId}, Subject ID: ${result.subjectId}`
            );
        }

    } catch (error) {
        console.error("Daily quiz scheduler error:", error);

    } finally {
        isRunning = false;
    }
};

// ==========================================
// START DAILY QUIZ SCHEDULER
// ==========================================

const startDailyQuizScheduler = () => {
    if (schedulerTask) {
        console.log("Daily quiz scheduler is already running");
        return;
    }

    schedulerTask = cron.schedule(
        "* * * * *",
        checkDailyQuizGeneration,
        {
            timezone: "Asia/Kolkata"
        }
    );

    console.log("Daily quiz scheduler started");
};

module.exports = {
    startDailyQuizScheduler
};
