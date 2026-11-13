
const db = require("../../../config/db");

// =====================================================
// GET STUDENT NOTIFICATIONS
// =====================================================

const getDailyQuizNotifications = async (req, res) => {
    try {
        const studentId = req.user.id;

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = 10;
        const offset = (page - 1) * limit;

        const [notifications] = await db.execute(
            `SELECT
                id,
                daily_quiz_id,
                notification_type,
                title,
                message,
                is_read,
                read_at,
                created_at
             FROM daily_quiz_notifications
             WHERE user_id = ?
             ORDER BY created_at DESC, id DESC
             LIMIT ? OFFSET ?`,
            [studentId, limit, offset]
        );

        const [[countResult]] = await db.execute(
            `SELECT COUNT(*) AS total
             FROM daily_quiz_notifications
             WHERE user_id = ?`,
            [studentId]
        );

        const total = countResult.total;

        return res.status(200).json({
            success: true,
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: offset + notifications.length < total
            }
        });

    } catch (error) {
        console.error("Get Daily Quiz Notifications Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve notifications."
        });
    }
};


// =====================================================
// GET UNREAD NOTIFICATION COUNT
// =====================================================

const getUnreadNotificationCount = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [[result]] = await db.execute(
            `SELECT COUNT(*) AS unread_count
             FROM daily_quiz_notifications
             WHERE user_id = ?
             AND is_read = 0`,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            unread_count: result.unread_count
        });

    } catch (error) {
        console.error("Unread Notification Count Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve unread notification count."
        });
    }
};


// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================

const markDailyQuizNotificationAsRead = async (req, res) => {
    try {
        const studentId = req.user.id;
        const notificationId = Number(req.params.notificationId);

        if (!Number.isInteger(notificationId) || notificationId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID."
            });
        }

        const [result] = await db.execute(
            `UPDATE daily_quiz_notifications
             SET is_read = 1,
                 read_at = UTC_TIMESTAMP()
             WHERE id = ?
             AND user_id = ?
             AND is_read = 0`,
            [notificationId, studentId]
        );

        if (result.affectedRows === 0) {
            const [[notification]] = await db.execute(
                `SELECT id
                 FROM daily_quiz_notifications
                 WHERE id = ?
                 AND user_id = ?`,
                [notificationId, studentId]
            );

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: "Notification not found."
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read."
        });

    } catch (error) {
        console.error("Mark Notification Read Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update notification."
        });
    }
};


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

const markAllDailyQuizNotificationsAsRead = async (req, res) => {
    try {
        const studentId = req.user.id;

        await db.execute(
            `UPDATE daily_quiz_notifications
             SET is_read = 1,
                 read_at = UTC_TIMESTAMP()
             WHERE user_id = ?
             AND is_read = 0`,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read."
        });

    } catch (error) {
        console.error("Mark All Notifications Read Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update notifications."
        });
    }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getDailyQuizNotifications,
    getUnreadNotificationCount,
    markDailyQuizNotificationAsRead,
    markAllDailyQuizNotificationsAsRead
};
