
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================================
// PRIVATE UPLOAD DIRECTORY
// ==========================================

const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    "career-resources",
    "originals"
);

// Create directory if it does not exist

fs.mkdirSync(uploadDirectory, {
    recursive: true
});


// ==========================================
// STORAGE CONFIGURATION
// ==========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {

        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueName =
            `career-resource-${Date.now()}-${require("crypto").randomUUID()}${extension}`;

        cb(null, uniqueName);
    }
});


// ==========================================
// FILE VALIDATION
// ==========================================

const allowedMimeTypes = [
    "application/pdf"
];

const fileFilter = (req, file, cb) => {

    const extension = path.extname(file.originalname).toLowerCase();

    if (
        extension !== ".pdf" ||
        !allowedMimeTypes.includes(file.mimetype)
    ) {

        return cb(
            new Error("Only PDF documents are allowed")
        );
    }

    cb(null, true);
};


// ==========================================
// MULTER INSTANCE
// ==========================================

const careerResourceUpload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }

});


module.exports = careerResourceUpload;
