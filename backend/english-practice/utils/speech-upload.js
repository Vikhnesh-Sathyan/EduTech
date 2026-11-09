const multer = require("multer");
const path = require("path");


const allowedExtensions = [
    ".wav",
    ".mp3",
    ".m4a",
    ".webm"
];

const allowedMimeTypes = [
    "audio/wav",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/x-m4a",
    "audio/webm"
];


const storage = multer.memoryStorage();


const fileFilter = (req, file, callback) => {

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const mimeType = file.mimetype
        .toLowerCase()
        .split(";")[0];

    if (
        !allowedExtensions.includes(extension) ||
        !allowedMimeTypes.includes(mimeType)
    ) {
        return callback(
            new Error("Unsupported audio format")
        );
    }

    callback(null, true);
};


const speechUpload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024
    }

});


module.exports = speechUpload;