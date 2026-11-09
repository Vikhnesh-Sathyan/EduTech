
const multer = require("multer");
const path = require("path");


const allowedExtensions = [".wav", ".mp3", ".m4a"];

const storage = multer.memoryStorage();


const fileFilter = (req, file, callback) => {

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
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
