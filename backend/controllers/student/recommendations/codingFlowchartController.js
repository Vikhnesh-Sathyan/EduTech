const db = require("../../../config/db");

//flowchart Creation

const createCodeFlowchart = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({
                message: "Only students can create flowcharts."
            });
        }

        const solutionId = Number(req.params.solutionId);

        if (!Number.isInteger(solutionId) || solutionId <= 0) {
            return res.status(400).json({
                message: "Invalid solution ID."
            });
        }

        const {
            title,
            generation_method,
            nodes,
            edges
        } = req.body;

        // Validate title
        if (
            title != null &&
            (
                typeof title !== "string" ||
                title.trim().length === 0 ||
                title.trim().length > 200
            )
        ) {
            return res.status(400).json({
                message: "Flowchart title must contain 1 to 200 characters."
            });
        }

        // Validate nodes and edges
        if (!Array.isArray(nodes) || nodes.length < 2) {
            return res.status(400).json({
                message: "A flowchart must contain at least two nodes."
            });
        }

        if (nodes.length > 200) {
            return res.status(400).json({
                message: "A maximum of 200 flowchart nodes is allowed."
            });
        }

        if (!Array.isArray(edges) || edges.length > 500) {
            return res.status(400).json({
                message: "Provide a valid list of flowchart connections."
            });
        }

        const allowedMethods = [
            "manual",
            "automatic",
            "ai_assisted"
        ];

        const allowedNodeTypes = [
            "start",
            "end",
            "input_output",
            "process",
            "decision",
            "connector"
        ];

        if (
            generation_method != null &&
            !allowedMethods.includes(generation_method)
        ) {
            return res.status(400).json({
                message: "Invalid flowchart generation method."
            });
        }

        // Validate and normalize nodes
        const nodeKeys = new Set();
        const normalizedNodes = [];

        for (const node of nodes) {
            if (
                !node ||
                typeof node !== "object" ||
                Array.isArray(node)
            ) {
                return res.status(400).json({
                    message: "Every flowchart node must be a valid object."
                });
            }

            if (
                typeof node.node_key !== "string" ||
                !node.node_key.trim() ||
                node.node_key.trim().length > 100 ||
                typeof node.label !== "string" ||
                !node.label.trim() ||
                node.label.trim().length > 500
            ) {
                return res.status(400).json({
                    message: "Every node requires a valid key and a label of 1 to 500 characters."
                });
            }

            const nodeKey = node.node_key.trim();

            if (nodeKeys.has(nodeKey)) {
                return res.status(400).json({
                    message: "Flowchart node keys must be unique."
                });
            }

            nodeKeys.add(nodeKey);

            if (
                node.node_type != null &&
                !allowedNodeTypes.includes(node.node_type)
            ) {
                return res.status(400).json({
                    message: `Invalid node type for ${nodeKey}.`
                });
            }

            for (const dimension of ["position_x", "position_y"]) {
                if (
                    node[dimension] !== undefined &&
                    (
                        node[dimension] === null ||
                        node[dimension] === "" ||
                        !Number.isFinite(Number(node[dimension])) ||
                        Math.abs(Number(node[dimension])) > 100000
                    )
                ) {
                    return res.status(400).json({
                        message: `Invalid ${dimension} for ${nodeKey}.`
                    });
                }
            }

            for (const dimension of ["width", "height"]) {
                if (
                    node[dimension] !== undefined &&
                    (
                        node[dimension] === null ||
                        node[dimension] === "" ||
                        !Number.isInteger(Number(node[dimension])) ||
                        Number(node[dimension]) <= 0 ||
                        Number(node[dimension]) > 2000
                    )
                ) {
                    return res.status(400).json({
                        message: `Invalid ${dimension} for ${nodeKey}.`
                    });
                }
            }

            normalizedNodes.push({
                ...node,
                node_key: nodeKey,
                label: node.label.trim()
            });
        }

        // Validate and normalize edges
        const edgeKeys = new Set();
        const normalizedEdges = [];

        for (const edge of edges) {
            if (
                !edge ||
                typeof edge !== "object" ||
                Array.isArray(edge) ||
                typeof edge.source_node_key !== "string" ||
                typeof edge.target_node_key !== "string"
            ) {
                return res.status(400).json({
                    message: "Every connection must specify valid source and target nodes."
                });
            }

            const sourceKey = edge.source_node_key.trim();
            const targetKey = edge.target_node_key.trim();

            if (
                !nodeKeys.has(sourceKey) ||
                !nodeKeys.has(targetKey) ||
                sourceKey === targetKey
            ) {
                return res.status(400).json({
                    message: "Every connection must link two different existing nodes."
                });
            }

            const connectionKey = `${sourceKey}->${targetKey}`;

            if (edgeKeys.has(connectionKey)) {
                return res.status(400).json({
                    message: "Duplicate flowchart connections are not allowed."
                });
            }

            edgeKeys.add(connectionKey);

            if (
                edge.edge_label != null &&
                (
                    typeof edge.edge_label !== "string" ||
                    edge.edge_label.length > 100
                )
            ) {
                return res.status(400).json({
                    message: "Connection labels cannot exceed 100 characters."
                });
            }

            normalizedEdges.push({
                ...edge,
                source_node_key: sourceKey,
                target_node_key: targetKey,
                edge_label: edge.edge_label?.trim() || null
            });
        }

        // Check solution ownership and availability
        const [solutions] = await db.query(
            `SELECT
                sol.id,
                sol.student_id,
                p.status AS post_status,
                s.status AS subject_status
             FROM student_code_solutions sol
             INNER JOIN student_code_posts p
                ON p.id = sol.post_id
             INNER JOIN subjects s
                ON s.id = p.subject_id
             WHERE sol.id = ?`,
            [solutionId]
        );

        if (solutions.length === 0) {
            return res.status(404).json({
                message: "Code solution not found."
            });
        }

        if (
            Number(solutions[0].student_id) !==
            Number(req.user.id)
        ) {
            return res.status(403).json({
                message: "You can only create flowcharts for your own solutions."
            });
        }

        if (
            solutions[0].post_status !== "published" ||
            solutions[0].subject_status !== "active"
        ) {
            return res.status(400).json({
                message: "The coding question or subject is not currently available."
            });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [existingCharts] = await connection.query(
                `SELECT COALESCE(MAX(version), 0) AS latest_version
                 FROM student_code_flowcharts
                 WHERE solution_id = ?
                 FOR UPDATE`,
                [solutionId]
            );

            const nextVersion =
                Number(existingCharts[0].latest_version) + 1;

            const [chartResult] = await connection.query(
                `INSERT INTO student_code_flowcharts
                (
                    solution_id,
                    title,
                    generation_method,
                    version,
                    status
                )
                VALUES (?, ?, ?, ?, 'draft')`,
                [
                    solutionId,
                    title?.trim() || "Algorithm Flowchart",
                    generation_method || "manual",
                    nextVersion
                ]
            );

            const flowchartId = chartResult.insertId;
            const nodeIdByKey = new Map();

            // Insert nodes
            for (const node of normalizedNodes) {
                const [nodeResult] = await connection.query(
                    `INSERT INTO student_code_flowchart_nodes
                    (
                        flowchart_id,
                        node_key,
                        label,
                        node_type,
                        position_x,
                        position_y,
                        width,
                        height
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        flowchartId,
                        node.node_key,
                        node.label,
                        node.node_type || "process",
                        node.position_x ?? 0,
                        node.position_y ?? 0,
                        node.width ?? 160,
                        node.height ?? 80
                    ]
                );

                nodeIdByKey.set(
                    node.node_key,
                    nodeResult.insertId
                );
            }

            // Insert connections
            for (const edge of normalizedEdges) {
                await connection.query(
                    `INSERT INTO student_code_flowchart_edges
                    (
                        flowchart_id,
                        source_node_id,
                        target_node_id,
                        edge_label
                    )
                    VALUES (?, ?, ?, ?)`,
                    [
                        flowchartId,
                        nodeIdByKey.get(edge.source_node_key),
                        nodeIdByKey.get(edge.target_node_key),
                        edge.edge_label
                    ]
                );
            }

            await connection.commit();

            return res.status(201).json({
                message: "Flowchart created successfully.",
                flowchart_id: flowchartId,
                version: nextVersion,
                total_nodes: normalizedNodes.length,
                total_edges: normalizedEdges.length
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Create coding flowchart error:", error);

        return res.status(500).json({
            message: "Failed to create flowchart."
        });
    }
};

const getCodeFlowchart = async (req, res) => {
    try {
        const solutionId = Number(req.params.solutionId);

        if (!Number.isInteger(solutionId) || solutionId <= 0) {
            return res.status(400).json({
                message: "Invalid solution ID."
            });
        }

        const [flowcharts] = await db.query(
            `SELECT
                f.id,
                f.solution_id,
                f.title,
                f.generation_method,
                f.version,
                f.status,
                f.created_at,
                f.updated_at
             FROM student_code_flowcharts f
             INNER JOIN student_code_solutions sol
                ON sol.id = f.solution_id
             INNER JOIN student_code_posts p
                ON p.id = sol.post_id
             INNER JOIN subjects s
                ON s.id = p.subject_id
             WHERE f.solution_id = ?
               AND p.status = 'published'
               AND s.status = 'active'
               AND (
                    f.status = 'published'
                    OR sol.student_id = ?
               )
             ORDER BY f.version DESC
             LIMIT 1`,
            [solutionId, req.user.id]
        );

        if (flowcharts.length === 0) {
            return res.status(404).json({
                message: "No accessible flowchart found for this solution."
            });
        }

        const flowchart = flowcharts[0];

        const [nodes] = await db.query(
            `SELECT
                id,
                node_key,
                label,
                node_type,
                position_x,
                position_y,
                width,
                height,
                algorithm_step_id
             FROM student_code_flowchart_nodes
             WHERE flowchart_id = ?
             ORDER BY id ASC`,
            [flowchart.id]
        );

        const [edges] = await db.query(
            `SELECT
                e.id,
                e.source_node_id,
                e.target_node_id,
                e.edge_label
             FROM student_code_flowchart_edges e
             WHERE e.flowchart_id = ?
             ORDER BY e.id ASC`,
            [flowchart.id]
        );

        return res.status(200).json({
            ...flowchart,
            nodes,
            edges
        });
    } catch (error) {
        console.error("Get coding flowchart error:", error);

        return res.status(500).json({
            message: "Failed to fetch flowchart."
        });
    }
};



module.exports = {
    createCodeFlowchart,
    getCodeFlowchart
};
