const db = require("../../../../config/db");
const {
    generateDistractors
} = require("../../../../utils/codeShuffleDistractorGenerator");

// =====================================================
// GET ACTIVE PROGRAMMING LANGUAGES
// Languages are managed by the admin.
// =====================================================
const getAvailableLanguages = async (req, res) => {
    try {
        const [subjects] = await db.query(`
            SELECT id, name
            FROM subjects
            WHERE status = 'active'
            ORDER BY name ASC
        `);

        return res.status(200).json({
            languages: subjects
        });
    } catch (err) {
        console.error('Active subjects fetch failed:', err.message);

        return res.status(500).json({
            message: 'Failed to fetch active subjects'
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
    let connection;

    try {
        connection = await db.getConnection();

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
            correctBlocks
        } = req.body;

        // 1. Validate basic task details
        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof description !== "string" ||
            !description.trim() ||
            !Number.isInteger(Number(languageId)) ||
            Number(languageId) <= 0 ||
            !["easy", "medium", "hard"].includes(difficulty) ||
            !Number.isFinite(Number(maxMarks)) ||
            Number(maxMarks) <= 0
        ) {
            return res.status(400).json({
                message:
                    "Please provide a title, description, language, difficulty and valid maximum marks."
            });
        }

        // 2. Validate selected topics
        if (
            !Array.isArray(topicIds) ||
            topicIds.length === 0 ||
            topicIds.some(
                id => !Number.isInteger(Number(id)) || Number(id) <= 0
            ) ||
            new Set(topicIds.map(Number)).size !== topicIds.length
        ) {
            return res.status(400).json({
                message: "Select at least one valid topic."
            });
        }

        // 3. Validate correct code blocks
        if (
            !Array.isArray(correctBlocks) ||
            correctBlocks.length < 2 ||
            correctBlocks.some(
                block => typeof block !== "string" || !block.trim()
            )
        ) {
            return res.status(400).json({
                message:
                    "Provide at least two non-empty correct code blocks."
            });
        }

        // 4. Validate optional hint
        if (
            hintText !== undefined &&
            hintText !== null &&
            typeof hintText !== "string"
        ) {
            return res.status(400).json({
                message: "Hint must be text."
            });
        }

        // 5. Validate publish date
        if (
            publishDate !== undefined &&
            publishDate !== null &&
            (
                typeof publishDate !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(publishDate) ||
                Number.isNaN(
                    Date.parse(`${publishDate}T00:00:00Z`)
                )
            )
        ) {
            return res.status(400).json({
                message: "Publish date must use YYYY-MM-DD format."
            });
        }

        // 6. Validate due date
        if (
            dueDate !== undefined &&
            dueDate !== null &&
            (
                typeof dueDate !== "string" ||
                Number.isNaN(Date.parse(dueDate))
            )
        ) {
            return res.status(400).json({
                message: "Due date must be a valid date and time."
            });
        }

        // 7. Validate the selected programming language
        const [languages] = await connection.execute(
    `SELECT id, name
     FROM subjects
     WHERE id = ?
       AND status = 'active'`,
    [Number(languageId)]
);

        if (languages.length === 0) {
            return res.status(400).json({
                message:
                    "The selected programming language is invalid or inactive."
            });
        }

        const languageName = languages[0].name;

        // 8. Validate that selected topics belong to this mentor
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
                message:
                    "One or more selected topics are invalid or do not belong to you."
            });
        }

        // 9. Generate distractors automatically
        const normalizedCorrectBlocks = correctBlocks.map(
            block => block.trim()
        );

        const correctContentSet = new Set(
            normalizedCorrectBlocks
        );

        const generatedDistractors = generateDistractors(
            normalizedCorrectBlocks,
            languageName
        );

        // Remove empty blocks, duplicates and exact matches
        // against the correct blocks.
        const uniqueDistractors = [
            ...new Set(
                generatedDistractors
                    .map(block =>
                        typeof block === "string"
                            ? block.trim()
                            : typeof block?.blockContent === "string"
                                ? block.blockContent.trim()
                                : ""
                    )
                    .filter(
                        content =>
                            content &&
                            !correctContentSet.has(content)
                    )
            )
        ].slice(0, 5);

        // 10. Save task and blocks in one transaction
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

        // Save topic relationships
        for (const topicId of topicIds) {
            await connection.execute(
                `INSERT INTO code_shuffle_task_topics
                    (task_id, topic_id)
                 VALUES (?, ?)`,
                [taskId, Number(topicId)]
            );
        }

        // Save correct blocks with their original order
        for (
            let index = 0;
            index < normalizedCorrectBlocks.length;
            index++
        ) {
            await connection.execute(
                `INSERT INTO code_shuffle_blocks
                    (
                        task_id,
                        block_content,
                        block_type,
                        correct_position
                    )
                 VALUES (?, ?, 'correct', ?)`,
                [
                    taskId,
                    normalizedCorrectBlocks[index],
                    index + 1
                ]
            );
        }

        // Save automatically generated distractors
        for (const blockContent of uniqueDistractors) {
            await connection.execute(
                `INSERT INTO code_shuffle_blocks
                    (
                        task_id,
                        block_content,
                        block_type,
                        correct_position
                    )
                 VALUES (?, ?, 'distractor', NULL)`,
                [taskId, blockContent]
            );
        }

        await connection.commit();

        return res.status(201).json({
            message: "Code Shuffle task saved as a draft.",
            taskId,
            correctBlockCount: normalizedCorrectBlocks.length,
            distractorCount: uniqueDistractors.length
        });

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Code Shuffle rollback error:",
                    rollbackError
                );
            }
        }

        console.error("Create Code Shuffle task error:", error);

        return res.status(500).json({
            message: "Failed to create the Code Shuffle task."
        });

    } finally {
        if (connection) {
            connection.release();
        }
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
                s.name AS language_name,
                COUNT(DISTINCT b.id) AS total_blocks,
                COUNT(DISTINCT tt.topic_id) AS topic_count
             FROM code_shuffle_tasks t
             JOIN subjects s
                ON s.id = t.language_id
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
                s.name
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
