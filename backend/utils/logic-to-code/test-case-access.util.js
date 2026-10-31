
// ==========================================
// CHECK TEST CASE MODIFICATION ACCESS
// ==========================================

const checkTestCaseModificationAccess = async (
    connection,
    problemId,
    mentorId
) => {
    // Lock the problem row during this transaction
    const [problems] = await connection.query(
        `SELECT id, status
         FROM logic_to_code_problems
         WHERE id = ? AND mentor_id = ?
         FOR UPDATE`,
        [problemId, mentorId]
    );

    if (problems.length === 0) {
        return {
            allowed: false,
            statusCode: 404,
            message: "Problem not found."
        };
    }

    const problem = problems[0];

    // Archived problems cannot be modified
    if (problem.status === "archived") {
        return {
            allowed: false,
            statusCode: 403,
            message: "Archived problems cannot have their test cases modified."
        };
    }

    // Protect existing submission history
    const [submissions] = await connection.query(
        `SELECT id
         FROM logic_to_code_submissions
         WHERE problem_id = ?
         LIMIT 1`,
        [problemId]
    );

    if (submissions.length > 0) {
        return {
            allowed: false,
            statusCode: 403,
            message: "Test cases cannot be modified because student submissions already exist."
        };
    }

    return {
        allowed: true
    };
};

module.exports = {
    checkTestCaseModificationAccess
};
