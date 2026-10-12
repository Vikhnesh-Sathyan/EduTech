
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Store recommendation files in backend/uploads/recommendation
const uploadDirectory = path.join(
    __dirname,
    "../../uploads/recommendation"
);

// Create the upload folder automatically if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

        cb(null, uniqueName);
    }
});

// Allow PDF files and common image formats
const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
];

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(new Error("Only PDF files and JPG, PNG, WEBP or GIF images are allowed."));
};

// Configure Multer
const resourceUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB maximum
    }
});

module.exports = resourceUpload;
