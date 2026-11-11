
const db = require("../../../config/db");

// ==========================================
// UPDATE DRAFT DAILY QUIZ
// ==========================================
const updateDailyQuiz = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const quizId = Number(req.params.quizId);

        const {
            subject_id,
            title,
            instructions,
            quiz_date,
            publish_time
        } = req.body;

        // ----------------------------------
        // VALIDATE QUIZ ID
        // ----------------------------------
        if (!Number.isInteger(quizId) || quizId <= 0) {
            return res.status(400).json({
                message: "Valid quiz ID is required"
            });
        }

        // ----------------------------------
        // VALIDATE SUBJECT
        // ----------------------------------
        if (
            !Number.isInteger(Number(subject_id)) ||
            Number(subject_id) <= 0
        ) {
            return res.status(400).json({
                message: "Valid subject ID is required"
            });
        }

        // ----------------------------------
        // VALIDATE TITLE
        // ----------------------------------
        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                message: "Quiz title is required"
            });
        }

        if (title.trim().length > 200) {
            return res.status(400).json({
                message: "Quiz title cannot exceed 200 characters"
            });
        }

        // ----------------------------------
        // VALIDATE INSTRUCTIONS
        // ----------------------------------
        if (
            instructions !== undefined &&
            instructions !== null &&
            typeof instructions !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid quiz instructions"
            });
        }

        // ----------------------------------
        // VALIDATE DATE
        // ----------------------------------
        if (
            typeof quiz_date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(quiz_date)
        ) {
            return res.status(400).json({
                message: "Quiz date must use YYYY-MM-DD format"
            });
        }

        const [year, month, day] = quiz_date.split("-").map(Number);

        const dateCheck = new Date(
            Date.UTC(year, month - 1, day)
        );

        if (
            dateCheck.getUTCFullYear() !== year ||
            dateCheck.getUTCMonth() !== month - 1 ||
            dateCheck.getUTCDate() !== day
        ) {
            return res.status(400).json({
                message: "Invalid quiz date"
            });
        }

        // ----------------------------------
        // VALIDATE PUBLICATION TIME
        // ----------------------------------
        if (
            typeof publish_time !== "string" ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(publish_time)
        ) {
            return res.status(400).json({
                message: "Publish time must use HH:MM format"
            });
        }

        // ----------------------------------
        // CHECK DATE AND TIME IN INDIA
        // ----------------------------------
        const indiaParts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        }).formatToParts(new Date());

        const getIndiaPart = (type) =>
            indiaParts.find(part => part.type === type).value;

        const todayIndia = [
            getIndiaPart("year"),
            getIndiaPart("month"),
            getIndiaPart("day")
        ].join("-");

        const currentIndiaTime =
            `${getIndiaPart("hour")}:${getIndiaPart("minute")}`;

        if (quiz_date < todayIndia) {
            return res.status(400).json({
                message: "Quiz date cannot be in the past"
            });
        }

        if (
            quiz_date === todayIndia &&
            publish_time <= currentIndiaTime
        ) {
            return res.status(400).json({
                message: "Publication time must be in the future"
            });
        }

        // ----------------------------------
        // CONVERT IST SCHEDULE TO UTC
        // ----------------------------------
        const [hours, minutes] = publish_time.split(":").map(Number);

        const scheduledDate = new Date(
            Date.UTC(year, month - 1, day, hours, minutes) -
            (5 * 60 + 30) * 60 * 1000
        );

        // Midnight IST on the following day
        const expiryDate = new Date(
            Date.UTC(year, month - 1, day + 1, 0, 0) -
            (5 * 60 + 30) * 60 * 1000
        );

        const toMySQLDateTime = (date) =>
            date.toISOString().slice(0, 19).replace("T", " ");

        const scheduledAt = toMySQLDateTime(scheduledDate);
        const expiresAt = toMySQLDateTime(expiryDate);

        // ----------------------------------
        // START TRANSACTION
        // ----------------------------------
        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        // Lock quiz while updating
        const [quizzes] = await connection.query(
            `SELECT id, status
             FROM daily_quizzes
             WHERE id = ?
             FOR UPDATE`,
            [quizId]
        );

        if (quizzes.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                message: "Daily quiz not found"
            });
        }

        if (quizzes[0].status !== "draft") {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Only draft quizzes can be edited"
            });
        }

        // ----------------------------------
        // CHECK EXISTING ATTEMPTS
        // ----------------------------------
        const [attempts] = await connection.query(
            `SELECT id
             FROM daily_quiz_attempts
             WHERE daily_quiz_id = ?
             LIMIT 1`,
            [quizId]
        );

        if (attempts.length > 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "This quiz cannot be edited because student attempts already exist"
            });
        }

        // ----------------------------------
        // CHECK ACTIVE SUBJECT
        // ----------------------------------
        const [subjects] = await connection.query(
            `SELECT id
             FROM subjects
             WHERE id = ?
             AND status = 'active'`,
            [Number(subject_id)]
        );

        if (subjects.length === 0) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(404).json({
                message: "Active subject not found"
            });
        }

        // ----------------------------------
        // UPDATE QUIZ
        // ----------------------------------
        await connection.query(
            `UPDATE daily_quizzes
             SET
                subject_id = ?,
                title = ?,
                instructions = ?,
                quiz_date = ?,
                publish_time = ?,
                scheduled_at = ?,
                expires_at = ?
             WHERE id = ?`,
            [
                Number(subject_id),
                title.trim(),
                typeof instructions === "string"
                    ? instructions.trim() || null
                    : null,
                quiz_date,
                publish_time + ":00",
                scheduledAt,
                expiresAt,
                quizId
            ]
        );

        await connection.commit();
        transactionStarted = false;

        return res.status(200).json({
            message: "Daily quiz updated successfully",
            quiz: {
                id: quizId,
                subject_id: Number(subject_id),
                title: title.trim(),
                instructions: typeof instructions === "string"
                    ? instructions.trim() || null
                    : null,
                quiz_date,
                publish_time: publish_time + ":00",
                scheduled_at: scheduledAt,
                expires_at: expiresAt,
                status: "draft"
            }
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
            transactionStarted = false;
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "A daily quiz already exists for this subject and date"
            });
        }

        console.error("Update daily quiz error:", error);

        return res.status(500).json({
            message: "Failed to update daily quiz"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// ==========================================
// EXPORT CONTROLLER
// ==========================================
module.exports = {
    updateDailyQuiz
};
