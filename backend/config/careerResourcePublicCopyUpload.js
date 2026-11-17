
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// ==========================================
// PUBLIC COPY STORAGE DIRECTORY
// ==========================================

const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    "career-resources",
    "public-copies"
);

fs.mkdirSync(uploadDirectory, {
    recursive: true
});

// ==========================================
// STORAGE
// ==========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {

        const filename =
            `public-copy-${Date.now()}-${crypto.randomUUID()}.pdf`;

        cb(null, filename);
    }
});

// ==========================================
// FILE VALIDATION
// ==========================================

const fileFilter = (req, file, cb) => {

    const extension = path.extname(file.originalname).toLowerCase();

    if (
        extension !== ".pdf" ||
        file.mimetype !== "application/pdf"
    ) {
        return cb(new Error("Only PDF documents are allowed"));
    }

    cb(null, true);
};

// ==========================================
// MULTER INSTANCE
// ==========================================

const careerResourcePublicCopyUpload = multer({

    storage,
    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

module.exports = careerResourcePublicCopyUpload;
