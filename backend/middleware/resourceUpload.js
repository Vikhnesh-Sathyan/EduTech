const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Store uploaded resources in the backend's uploads/resources folder.
const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    "resources"
);

// Create the folder automatically if it does not exist.
fs.mkdirSync(uploadDirectory, { recursive: true });

// Configure where and how uploaded files are stored.
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        // Generate a unique filename to avoid overwriting existing files.
        const filename =
            `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;

        callback(null, filename);
    }
});

// Allow only PDF files and supported image formats.
const fileFilter = (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const allowedFiles = {
        ".pdf": ["application/pdf"],
        ".jpg": ["image/jpeg"],
        ".jpeg": ["image/jpeg"],
        ".png": ["image/png"],
        ".webp": ["image/webp"],
        ".gif": ["image/gif"]
    };

    const allowedMimeTypes = allowedFiles[extension];

    if (
        !allowedMimeTypes ||
        !allowedMimeTypes.includes(file.mimetype)
    ) {
        return callback(
            new Error(
                "Only PDF, JPG, JPEG, PNG, WEBP, and GIF files are allowed."
            )
        );
    }

    callback(null, true);
};

// Configure upload restrictions.
const uploadResource = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // Maximum 10 MB
        files: 1
    }
}).single("file");

module.exports = uploadResource;