const cron = require("node-cron");

const {
    generateDailyQuizNotifications
} = require("./dailyQuizNotification.job");

// ==========================================
// START DAILY QUIZ SCHEDULER
// ==========================================
const startDailyQuizScheduler = (io) => {

    cron.schedule("* * * * *", () => {

        generateDailyQuizNotifications(io);

    });

    console.log("Daily Quiz Notification Scheduler Started");
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
    startDailyQuizScheduler
};