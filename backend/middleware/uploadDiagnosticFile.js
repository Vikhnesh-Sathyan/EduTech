
const multer = require("multer");
const path = require("path");

// =====================================================
// SPREADSHEET FILE VALIDATION
// =====================================================

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = [".xlsx", ".csv"];

    if (allowedExtensions.includes(extension)) {
        return cb(null, true);
    }

    return cb(
        new Error("Only Excel (.xlsx) and CSV (.csv) files are allowed"),
        false
    );
};

// =====================================================
// UPLOAD CONFIGURATION
// =====================================================

const uploadDiagnosticFile = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

module.exports = uploadDiagnosticFile;