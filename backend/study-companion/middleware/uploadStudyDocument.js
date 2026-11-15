
const multer = require("multer");

const uploadStudyDocument = multer({
    storage: multer.memoryStorage(),

    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(
                new Error("Only PDF files are allowed"),
                false
            );
        }

        cb(null, true);
    },

    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    }
});

module.exports = uploadStudyDocument;
