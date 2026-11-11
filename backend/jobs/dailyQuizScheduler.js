
const cron = require("node-cron");

const {
    generateDailyQuizNotifications
} = require("./dailyQuizNotification.job");

let schedulerTask = null;
let isRunning = false;

// ==========================================
// CHECK DAILY QUIZ NOTIFICATIONS
// ==========================================

const checkDailyQuizNotifications = async (io) => {
    if (isRunning) return;

    isRunning = true;

    try {
        await generateDailyQuizNotifications(io);
    } catch (error) {
        console.error("Daily quiz notification scheduler error:", error);
    } finally {
        isRunning = false;
    }
};

// ==========================================
// START DAILY QUIZ SCHEDULER
// ==========================================

const startDailyQuizScheduler = (io) => {

    if (schedulerTask) {
        console.log("Daily Quiz Notification Scheduler already started");
        return;
    }

    schedulerTask = cron.schedule(
        "* * * * *",
        () => checkDailyQuizNotifications(io),
        {
            timezone: "Asia/Kolkata"
        }
    );

    console.log("Daily Quiz Notification Scheduler Started");
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    startDailyQuizScheduler
};
