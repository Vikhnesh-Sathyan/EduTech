
const db = require("../../../../config/db");

// =====================================================
// GET ACTIVE PROGRAMMING LANGUAGES
// Languages are managed by the admin.
// =====================================================

const getAvailableLanguages = async (req, res) => {
    try {
        const [languages] = await db.query(`
            SELECT id, name, slug
            FROM code_shuffle_languages
            WHERE status = 'active'
            ORDER BY name ASC
        `);

        return res.status(200).json({ languages });
    } catch (error) {
        console.error("Get Code Shuffle languages error:", error);

        return res.status(500).json({
            message: "Failed to fetch programming languages."
        });
    }
};

// =====================================================
// GET TOPICS CREATED BY THE LOGGED-IN MENTOR
// =====================================================

const getMyTopics = async (req, res) => {
    try {
        const mentorId = req.user.id;

        const [topics] = await db.query(
            `SELECT id, name, description, status, created_at, updated_at
             FROM code_shuffle_topics
             WHERE mentor_id = ?
             ORDER BY created_at DESC`,
            [mentorId]
        );

        return res.status(200).json({ topics });
    } catch (error) {
        console.error("Get Code Shuffle topics error:", error);

        return res.status(500).json({
            message: "Failed to fetch your topics."
        });
    }
};

// =====================================================
// CREATE A TOPIC
// =====================================================

const createTopic = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { name, description } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Topic name is required."
            });
        }

        const topicName = name.trim();
        const topicDescription =
            typeof description === "string" && description.trim()
                ? description.trim()
                : null;

        const [existingTopics] = await db.query(
            `SELECT id
             FROM code_shuffle_topics
             WHERE mentor_id = ?
               AND LOWER(name) = LOWER(?)
             LIMIT 1`,
            [mentorId, topicName]
        );

        if (existingTopics.length > 0) {
            return res.status(409).json({
                message: "You have already created this topic."
            });
        }

        const [result] = await db.query(
            `INSERT INTO code_shuffle_topics
                (mentor_id, name, description, status)
             VALUES (?, ?, ?, 'active')`,
            [mentorId, topicName, topicDescription]
        );

        return res.status(201).json({
            message: "Topic created successfully.",
            topic: {
                id: result.insertId,
                name: topicName,
                description: topicDescription,
                status: "active"
            }
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "You have already created this topic."
            });
        }

        console.error("Create Code Shuffle topic error:", error);

        return res.status(500).json({
            message: "Failed to create the topic."
        });
    }
};

// =====================================================
// CREATE A CODE SHUFFLE TASK
// Correct blocks and distractor blocks are stored separately
// using block_type and correct_position.
// =====================================================

const createTask = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const mentorId = req.user.id;

        const {
            title,
            description,
            languageId,
            difficulty,
            maxMarks,
            hintText,
            publishDate,
            dueDate,
            topicIds,
            correctBlocks,
            distractorBlocks
        } = req.body;

        // ---------------------------------------------
        // Validate basic task details
        // ---------------------------------------------

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            !Number.isInteger(Number(languageId)) ||
            !["easy", "medium", "hard"].includes(difficulty) ||
            !Number.isFinite(Number(maxMarks)) ||
            Number(maxMarks) <= 0
        ) {
            return res.status(400).json({
                message: "Please provide a title, description, language, difficulty and valid maximum marks."
            });
        }

        // ---------------------------------------------
        // Validate topics
        // ---------------------------------------------

        if (
            !Array.isArray(topicIds) ||
            topicIds.length === 0 ||
            topicIds.some(id => !Number.isInteger(Number(id)) || Number(id) <= 0) ||
            new Set(topicIds.map(Number)).size !== topicIds.length
        ) {
            return res.status(400).json({
                message: "Select at least one valid topic."
            });
        }

        // ---------------------------------------------
        // Validate correct code blocks
        // ---------------------------------------------

        if (
            !Array.isArray(correctBlocks) ||
            correctBlocks.length < 2 ||
            correctBlocks.some(block =>
                typeof block !== "string" || !block.trim()
            )
        ) {
            return res.status(400).json({
                message: "Provide at least two non-empty correct code blocks."
            });
        }

        // ---------------------------------------------
        // Validate optional distractor blocks
        // ---------------------------------------------

        const safeDistractorBlocks =
            distractorBlocks === undefined ? [] : distractorBlocks;

        if (
            !Array.isArray(safeDistractorBlocks) ||
            safeDistractorBlocks.some(block =>
                typeof block !== "string" || !block.trim()
            )
        ) {
            return res.status(400).json({
                message: "Each distractor must contain non-empty code."
            });
        }

        // ---------------------------------------------
        // Validate optional hint and dates
        // ---------------------------------------------

        if (
            hintText !== undefined &&
            hintText !== null &&
            typeof hintText !== "string"
        ) {
            return res.status(400).json({
                message: "Hint must be text."
            });
        }

        if (
            publishDate !== undefined &&
            publishDate !== null &&
            (typeof publishDate !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(publishDate) ||
                Number.isNaN(Date.parse(`${publishDate}T00:00:00Z`)))
        ) {
            return res.status(400).json({
                message: "Publish date must use YYYY-MM-DD format."
            });
        }

        if (
            dueDate !== undefined &&
            dueDate !== null &&
            (typeof dueDate !== "string" ||
                Number.isNaN(Date.parse(dueDate)))
        ) {
            return res.status(400).json({
                message: "Due date must be a valid date and time."
            });
        }

        // ---------------------------------------------
        // Validate active language and mentor-owned topics
        // ---------------------------------------------

        const [languages] = await connection.execute(
            `SELECT id
             FROM code_shuffle_languages
             WHERE id = ? AND status = 'active'`,
            [Number(languageId)]
        );

        if (languages.length === 0) {
            return res.status(400).json({
                message: "The selected programming language is invalid or inactive."
            });
        }

        const placeholders = topicIds.map(() => "?").join(", ");

        const [topics] = await connection.execute(
            `SELECT id
             FROM code_shuffle_topics
             WHERE mentor_id = ?
               AND status = 'active'
               AND id IN (${placeholders})`,
            [mentorId, ...topicIds.map(Number)]
        );

        if (topics.length !== topicIds.length) {
            return res.status(400).json({
                message: "One or more selected topics are invalid or do not belong to you."
            });
        }

        // ---------------------------------------------
        // Save task, topics and blocks in one transaction
        // ---------------------------------------------

        await connection.beginTransaction();

        const [taskResult] = await connection.execute(
            `INSERT INTO code_shuffle_tasks
                (
                    mentor_id,
                    language_id,
                    title,
                    description,
                    difficulty,
                    max_marks,
                    hint_text,
                    publish_date,
                    due_date,
                    status
                )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [
                mentorId,
                Number(languageId),
                title.trim(),
                description.trim(),
                difficulty,
                Number(maxMarks),
                typeof hintText === "string" && hintText.trim()
                    ? hintText.trim()
                    : null,
                publishDate || null,
                dueDate || null
            ]
        );

        const taskId = taskResult.insertId;

        // Attach selected topics to this task.
        for (const topicId of topicIds) {
            await connection.execute(
                `INSERT INTO code_shuffle_task_topics
                    (task_id, topic_id)
                 VALUES (?, ?)`,
                [taskId, Number(topicId)]
            );
        }

        // Correct blocks keep their original correct positions.
        for (let index = 0; index < correctBlocks.length; index++) {
            await connection.execute(
                `INSERT INTO code_shuffle_blocks
                    (task_id, block_content, block_type, correct_position)
                 VALUES (?, ?, 'correct', ?)`,
                [taskId, correctBlocks[index].trim(), index + 1]
            );
        }

        // Distractors have no correct position.
        for (const block of safeDistractorBlocks) {
            await connection.execute(
                `INSERT INTO code_shuffle_blocks
                    (task_id, block_content, block_type, correct_position)
                 VALUES (?, ?, 'distractor', NULL)`,
                [taskId, block.trim()]
            );
        }

        await connection.commit();

        return res.status(201).json({
            message: "Code Shuffle task saved as a draft.",
            taskId
        });
    } catch (error) {
        await connection.rollback();

        console.error("Create Code Shuffle task error:", error);

        return res.status(500).json({
            message: "Failed to create the Code Shuffle task."
        });
    } finally {
        connection.release();
    }
};

// =====================================================
// GET TASKS CREATED BY THE LOGGED-IN MENTOR
// Does not expose the correct code or distractor labels.
// =====================================================

const getMyTasks = async (req, res) => {
    try {
        const mentorId = req.user.id;

        const [tasks] = await db.query(
            `SELECT
                t.id,
                t.title,
                t.description,
                t.difficulty,
                t.max_marks,
                t.publish_date,
                t.due_date,
                t.status,
                t.created_at,
                t.updated_at,
                l.name AS language_name,
                COUNT(DISTINCT b.id) AS total_blocks,
                COUNT(DISTINCT tt.topic_id) AS topic_count
             FROM code_shuffle_tasks t
             JOIN code_shuffle_languages l
                ON l.id = t.language_id
             LEFT JOIN code_shuffle_blocks b
                ON b.task_id = t.id
             LEFT JOIN code_shuffle_task_topics tt
                ON tt.task_id = t.id
             WHERE t.mentor_id = ?
             GROUP BY
                t.id,
                t.title,
                t.description,
                t.difficulty,
                t.max_marks,
                t.publish_date,
                t.due_date,
                t.status,
                t.created_at,
                t.updated_at,
                l.name
             ORDER BY t.created_at DESC`,
            [mentorId]
        );

        return res.status(200).json({ tasks });
    } catch (error) {
        console.error("Get Code Shuffle tasks error:", error);

        return res.status(500).json({
            message: "Failed to fetch your Code Shuffle tasks."
        });
    }
};

module.exports = {
    getAvailableLanguages,
    getMyTopics,
    createTopic,
    createTask,
    getMyTasks
};
