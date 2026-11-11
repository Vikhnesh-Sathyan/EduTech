
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },

    fileFilter: (req, file, cb) => {
        const isCsv =
            file.originalname.toLowerCase().endsWith(".csv") &&
            (
                file.mimetype === "text/csv" ||
                file.mimetype === "application/vnd.ms-excel" ||
                file.mimetype === "application/csv" ||
                file.mimetype === "application/octet-stream"
            );

        if (!isCsv) {
            return cb(new Error("Only CSV files are allowed"));
        }

        cb(null, true);
    }
});

module.exports = upload;
