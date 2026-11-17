
const multer = require("multer");

// ==========================================
// ALLOWED IMAGE TYPES
// ==========================================

const allowedMimeTypes = [
    "image/png",
    "image/jpeg"
];

// ==========================================
// FILE FILTER
// ==========================================

const fileFilter = (req, file, cb) => {

    if (!allowedMimeTypes.includes(file.mimetype)) {

        return cb(
            new Error("Only PNG and JPEG images are allowed")
        );
    }

    cb(null, true);
};

// ==========================================
// MULTER CONFIGURATION
// ==========================================

const careerResourcePageUpload = multer({

    storage: multer.memoryStorage(),

    fileFilter,

    limits: {
        files: 20,
        fileSize: 2 * 1024 * 1024
    }

});

module.exports = careerResourcePageUpload;
