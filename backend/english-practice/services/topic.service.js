
const db = require("../../config/db");
const aiClient = require("./ai.service");


// Fetch active topics available to a student
const getAvailableTopics = async (studentId) => {

    const [rows] = await db.execute(
        `SELECT
            est.id,
            est.subject_id,
            est.title,
            est.prompt,
            est.category,
            est.difficulty
         FROM english_speaking_topics est
         WHERE est.status = 'active'
         AND (
            est.subject_id IS NULL
            OR est.subject_id IN (
                SELECT ss.subject_id
                FROM student_subjects ss
                WHERE ss.student_id = ?
            )
         )
         ORDER BY est.created_at DESC`,
        [studentId]
    );

    return rows;
};


// Generate a random topic using Python AI service
const generateTopic = async (
    availableTopics,
    category = null,
    difficulty = null
) => {

    try {

        const response = await aiClient.post(
            "/api/topics/random",
            {
                available_topics: availableTopics,
                category,
                difficulty
            }
        );

        return response.data;

    } catch (error) {

        if (error.code === "ECONNREFUSED") {
            throw new Error("Python AI service is unavailable");
        }

        if (
            error.code === "ECONNABORTED" ||
            error.code === "ETIMEDOUT"
        ) {
            throw new Error("Python AI service request timed out");
        }

        if (error.response) {
            throw new Error(
                error.response.data.detail ||
                "Python AI service returned an error"
            );
        }

        throw new Error(
            "Unable to communicate with Python AI service"
        );
    }
};


module.exports = {
    getAvailableTopics,
    generateTopic
};
