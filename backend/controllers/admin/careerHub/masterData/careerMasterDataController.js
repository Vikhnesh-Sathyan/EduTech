
const db = require("../../../../config/db");

// ==========================================
// MASTER DATA CONFIGURATION
// ==========================================

const masterConfig = {

    companies: {
        table: "career_companies",
        nameColumn: "company_name",
        nameLength: 150
    },

    roles: {
        table: "career_job_roles",
        nameColumn: "role_name",
        nameLength: 150
    },

    countries: {
        table: "career_countries",
        nameColumn: "country_name",
        nameLength: 100,
        codeColumn: "country_code"
    }

};


// ==========================================
// COMMON VALIDATION
// ==========================================

const validateId = (id) => {

    return (
        Number.isInteger(Number(id)) &&
        Number(id) > 0
    );

};


const handleDatabaseError = (error, res, message) => {

    if (error.code === "ER_DUP_ENTRY") {

        return res.status(409).json({
            success: false,
            message: "This record already exists"
        });

    }

    console.error(message, error);

    return res.status(500).json({
        success: false,
        message
    });

};


// ==========================================
// GET ALL CAREER MASTER DATA
// ==========================================

const getCareerMasterData = async (req, res) => {

    try {

        const companiesSql = `
            SELECT
                id,
                company_name,
                is_active,
                created_at,
                updated_at
            FROM career_companies
            ORDER BY company_name
        `;

        const rolesSql = `
            SELECT
                id,
                role_name,
                is_active,
                created_at,
                updated_at
            FROM career_job_roles
            ORDER BY role_name
        `;

        const countriesSql = `
            SELECT
                id,
                country_name,
                country_code,
                is_active,
                created_at,
                updated_at
            FROM career_countries
            ORDER BY country_name
        `;

        const [companies] = await db.execute(companiesSql);
        const [roles] = await db.execute(rolesSql);
        const [countries] = await db.execute(countriesSql);

        return res.status(200).json({
            success: true,
            message: "Career master data fetched successfully",
            data: {
                companies,
                roles,
                countries
            }
        });

    } catch (error) {

        console.error("Get career master data error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch career master data"
        });

    }

};


// ==========================================
// CREATE MASTER DATA RECORD
// ==========================================

const createMasterRecord = async (req, res, config, type) => {

    try {

        const name = req.body[config.nameColumn];

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: `${config.nameColumn} is required`
            });

        }

        const trimmedName = name.trim();

        if (trimmedName.length > config.nameLength) {

            return res.status(400).json({
                success: false,
                message: `Name cannot exceed ${config.nameLength} characters`
            });

        }

        let sql;
        let values;

        if (type === "countries") {

            const countryCode = req.body.country_code;

            if (
                typeof countryCode !== "string" ||
                !/^[A-Za-z]{2}$/.test(countryCode.trim())
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Country code must contain exactly two letters"
                });

            }

            sql = `
                INSERT INTO ${config.table}
                (
                    ${config.nameColumn},
                    ${config.codeColumn}
                )
                VALUES (?, ?)
            `;

            values = [
                trimmedName,
                countryCode.trim().toUpperCase()
            ];

        } else {

            sql = `
                INSERT INTO ${config.table}
                (${config.nameColumn})
                VALUES (?)
            `;

            values = [trimmedName];

        }

        const [result] = await db.execute(sql, values);

        return res.status(201).json({
            success: true,
            message: "Master data record created successfully",
            data: {
                id: result.insertId
            }
        });

    } catch (error) {

        return handleDatabaseError(
            error,
            res,
            "Failed to create master data record"
        );

    }

};


// ==========================================
// UPDATE MASTER DATA RECORD
// ==========================================

const updateMasterRecord = async (req, res, config, type) => {

    try {

        const { id } = req.params;

        if (!validateId(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid record ID"
            });

        }

        const name = req.body[config.nameColumn];

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: `${config.nameColumn} is required`
            });

        }

        const trimmedName = name.trim();

        if (trimmedName.length > config.nameLength) {

            return res.status(400).json({
                success: false,
                message: `Name cannot exceed ${config.nameLength} characters`
            });

        }

        let sql;
        let values;

        if (type === "countries") {

            const countryCode = req.body.country_code;

            if (
                typeof countryCode !== "string" ||
                !/^[A-Za-z]{2}$/.test(countryCode.trim())
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Country code must contain exactly two letters"
                });

            }

            sql = `
                UPDATE ${config.table}

                SET
                    ${config.nameColumn} = ?,
                    ${config.codeColumn} = ?

                WHERE id = ?
            `;

            values = [
                trimmedName,
                countryCode.trim().toUpperCase(),
                Number(id)
            ];

        } else {

            sql = `
                UPDATE ${config.table}

                SET ${config.nameColumn} = ?

                WHERE id = ?
            `;

            values = [
                trimmedName,
                Number(id)
            ];

        }

        const [result] = await db.execute(sql, values);

        if (result.affectedRows === 0) {

            const [records] = await db.execute(
                `SELECT id FROM ${config.table} WHERE id = ?`,
                [Number(id)]
            );

            if (records.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Master data record not found"
                });

            }

        }

        return res.status(200).json({
            success: true,
            message: "Master data record updated successfully"
        });

    } catch (error) {

        return handleDatabaseError(
            error,
            res,
            "Failed to update master data record"
        );

    }

};


// ==========================================
// TOGGLE MASTER DATA STATUS
// ==========================================

const toggleMasterRecordStatus = async (req, res, config) => {

    try {

        const { id } = req.params;
        const { is_active } = req.body;

        if (!validateId(id)) {

            return res.status(400).json({
                success: false,
                message: "Invalid record ID"
            });

        }

        if (
            ![0, 1, "0", "1", true, false].includes(is_active)
        ) {

            return res.status(400).json({
                success: false,
                message: "is_active must be 0 or 1"
            });

        }

        const activeStatus = Number(is_active);

        const sql = `
            UPDATE ${config.table}

            SET is_active = ?

            WHERE id = ?
        `;

        const [result] = await db.execute(
            sql,
            [
                activeStatus,
                Number(id)
            ]
        );

        if (result.affectedRows === 0) {

            const [records] = await db.execute(
                `SELECT id FROM ${config.table} WHERE id = ?`,
                [Number(id)]
            );

            if (records.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Master data record not found"
                });

            }

        }

        return res.status(200).json({
            success: true,
            message: activeStatus
                ? "Master data record activated successfully"
                : "Master data record deactivated successfully"
        });

    } catch (error) {

        console.error("Toggle master data status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update master data status"
        });

    }

};


// ==========================================
// COMPANY CONTROLLERS
// ==========================================

const createCompany = (req, res) => {

    return createMasterRecord(
        req,
        res,
        masterConfig.companies,
        "companies"
    );

};


const updateCompany = (req, res) => {

    return updateMasterRecord(
        req,
        res,
        masterConfig.companies,
        "companies"
    );

};


const toggleCompanyStatus = (req, res) => {

    return toggleMasterRecordStatus(
        req,
        res,
        masterConfig.companies
    );

};


// ==========================================
// JOB ROLE CONTROLLERS
// ==========================================

const createJobRole = (req, res) => {

    return createMasterRecord(
        req,
        res,
        masterConfig.roles,
        "roles"
    );

};


const updateJobRole = (req, res) => {

    return updateMasterRecord(
        req,
        res,
        masterConfig.roles,
        "roles"
    );

};


const toggleJobRoleStatus = (req, res) => {

    return toggleMasterRecordStatus(
        req,
        res,
        masterConfig.roles
    );

};


// ==========================================
// COUNTRY CONTROLLERS
// ==========================================

const createCountry = (req, res) => {

    return createMasterRecord(
        req,
        res,
        masterConfig.countries,
        "countries"
    );

};


const updateCountry = (req, res) => {

    return updateMasterRecord(
        req,
        res,
        masterConfig.countries,
        "countries"
    );

};


const toggleCountryStatus = (req, res) => {

    return toggleMasterRecordStatus(
        req,
        res,
        masterConfig.countries
    );

};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {

    getCareerMasterData,

    // Companies
    createCompany,
    updateCompany,
    toggleCompanyStatus,

    // Job roles
    createJobRole,
    updateJobRole,
    toggleJobRoleStatus,

    // Countries
    createCountry,
    updateCountry,
    toggleCountryStatus

};
