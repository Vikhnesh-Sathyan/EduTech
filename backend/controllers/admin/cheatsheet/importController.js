
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const db = require("../../../config/db");

// ==========================================
// IMPORT TECHNOLOGIES FROM CSV
// ==========================================
const importTechnologies = async (req, res) => {
    try {
        // 1. Locate the CSV file
        const csvPath = path.join(
            __dirname,
            "../../../data/cheatsheet/technologies.csv"
        );

        if (!fs.existsSync(csvPath)) {
            return res.status(404).json({
                message: "Technologies CSV file not found."
            });
        }

        // 2. Find an admin user
        const [admins] = await db.query(
            "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
        );

        if (admins.length === 0) {
            return res.status(400).json({
                message: "No admin user found."
            });
        }

        // 3. Read all CSV rows
        const technologies = [];

        await new Promise((resolve, reject) => {
            fs.createReadStream(csvPath)
    .pipe(csv({
    skipLines: 0,
    mapHeaders: ({ header }) => header.trim()
}))
    .on("headers", (headers) => {
        console.log("CSV headers:", headers);
    })
    .on("data", (row) => {
        if (technologies.length === 0) {
            console.log("CSV first row:", row);
        }
                    // Remove a possible UTF-8 BOM from the first header
                    if (technologies.length === 0) {
                        const firstKey = Object.keys(row)[0];

                        if (firstKey && firstKey.charCodeAt(0) === 0xFEFF) {
                            const correctedKey = firstKey.slice(1);
                            row[correctedKey] = row[firstKey];
                            delete row[firstKey];
                        }
                    }

                    technologies.push(row);
                })
                .on("end", resolve)
                .on("error", reject);
        });

        if (technologies.length === 0) {
            return res.status(400).json({
                message: "The CSV file contains no technologies."
            });
        }

        // 4. Validate every CSV row before importing
        const seenNames = new Set();

        for (let i = 0; i < technologies.length; i++) {
            const technology = technologies[i];
            const rowNumber = i + 2;

            const name = technology.name?.trim();
            const sortName = technology.sort_name?.trim();
            const status = technology.status?.trim().toLowerCase();

            if (!name || !sortName || !status) {
                return res.status(400).json({
                    message:
                        `CSV row ${rowNumber}: name, sort_name, ` +
                        "and status are required."
                });
            }

            if (!["active", "inactive"].includes(status)) {
                return res.status(400).json({
                    message:
                        `CSV row ${rowNumber}: status must be ` +
                        "active or inactive."
                });
            }

            const normalizedName = name.toLowerCase();

            if (seenNames.has(normalizedName)) {
                return res.status(400).json({
                    message:
                        `CSV row ${rowNumber}: duplicate technology ` +
                        `"${name}".`
                });
            }

            seenNames.add(normalizedName);

            // Store normalized values
            technology.name = name;
            technology.sort_name = sortName;
            technology.status = status;
            technology.description =
                technology.description?.trim() || null;
        }

        // 5. Insert new technologies without overwriting existing records
        let added = 0;
        let skipped = 0;

        for (const technology of technologies) {
            const [result] = await db.query(
                `INSERT IGNORE INTO developer_technologies
                    (name, sort_name, description, created_by, status)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    technology.name,
                    technology.sort_name,
                    technology.description,
                    admins[0].id,
                    technology.status
                ]
            );

            if (result.affectedRows === 1) {
                added++;
            } else {
                skipped++;
            }
        }

        // 6. Return import summary
        return res.status(200).json({
            message: "Technologies imported successfully.",
            total: technologies.length,
            added,
            skipped
        });

    } catch (error) {
        console.error("Technology import error:", error);

        return res.status(500).json({
            message: "Failed to import technologies."
        });
    }
};

module.exports = {
    importTechnologies
};
