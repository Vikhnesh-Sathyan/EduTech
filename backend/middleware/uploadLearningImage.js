const multer = require("multer");
const path = require("path");

// =====================================================
// IMAGE STORAGE CONFIGURATION
// =====================================================

const storage = multer.diskStorage({

    // Where the uploaded image will be stored
    destination: (req, file, cb) => {
        cb(null, "uploads/learning");
    },

    // How the uploaded file will be named
    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});


// =====================================================
// FILE TYPE VALIDATION
// =====================================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, PNG and WebP images are allowed"
            ),
            false
        );
    }
};


// =====================================================
// MULTER UPLOAD
// =====================================================

const uploadLearningImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = uploadLearningImage;