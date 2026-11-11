
const db = require("../../../config/db");

// ==========================================
// GET STUDENT DAILY QUIZ NOTIFICATIONS
// ==========================================
const getDailyQuizNotifications = async (req, res) => {
    try {
        const studentId = req.user.id;

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = 20;
        const offset = (page - 1) * limit;

        // ----------------------------------
        // GET NOTIFICATIONS
        // ----------------------------------
        const [notifications] = await db.query(
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

        // ----------------------------------
        // GET TOTAL COUNT
        // ----------------------------------
        const [[countResult]] = await db.query(
            `SELECT
                COUNT(*) AS total_notifications,
                SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unread_count
             FROM daily_quiz_notifications
             WHERE user_id = ?`,
            [studentId]
        );

        const totalNotifications =
            Number(countResult.total_notifications);

        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: {
                notifications,
                unread_count: Number(countResult.unread_count || 0),
                pagination: {
                    current_page: page,
                    limit,
                    total_notifications: totalNotifications,
                    total_pages: Math.ceil(totalNotifications / limit)
                }
            }
        });

    } catch (error) {
        console.error("Get daily quiz notifications error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
};

// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================
const markDailyQuizNotificationRead = async (req, res) => {
    try {
        const studentId = req.user.id;
        const notificationId = Number(req.params.notificationId);

        if (!Number.isInteger(notificationId) || notificationId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }

        const [result] = await db.query(
            `UPDATE daily_quiz_notifications
             SET
                is_read = 1,
                read_at = UTC_TIMESTAMP()
             WHERE id = ?
                AND user_id = ?`,
            [notificationId, studentId]
        );

        if (result.affectedRows === 0) {
            const [[notification]] = await db.query(
                `SELECT id
                 FROM daily_quiz_notifications
                 WHERE id = ?
                    AND user_id = ?`,
                [notificationId, studentId]
            );

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: "Notification not found"
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });

    } catch (error) {
        console.error("Mark notification as read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update notification"
        });
    }
};

// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================
const markAllDailyQuizNotificationsRead = async (req, res) => {
    try {
        const studentId = req.user.id;

        const [result] = await db.query(
            `UPDATE daily_quiz_notifications
             SET
                is_read = 1,
                read_at = UTC_TIMESTAMP()
             WHERE user_id = ?
                AND is_read = 0`,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            updated_count: result.affectedRows
        });

    } catch (error) {
        console.error("Mark all notifications as read error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update notifications"
        });
    }
};

// ==========================================
// EXPORT
// ==========================================
module.exports = {
    getDailyQuizNotifications,
    markDailyQuizNotificationRead,
    markAllDailyQuizNotificationsRead
};
