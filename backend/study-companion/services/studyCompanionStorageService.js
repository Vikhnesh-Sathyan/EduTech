
const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const UPLOAD_DIRECTORY = path.join(
    __dirname,
    "..",
    "uploads"
);

// ==========================================
// STORE FILE PERMANENTLY
// ==========================================

const storeFile = async (file, extension) => {

    if (!file || !file.buffer) {
        throw new Error("File is required.");
    }

    await fs.mkdir(UPLOAD_DIRECTORY, {
        recursive: true
    });

    const storedFilename = `${randomUUID()}${extension}`;

    const filePath = path.join(
        UPLOAD_DIRECTORY,
        storedFilename
    );

    await fs.writeFile(filePath, file.buffer, {
        flag: "wx"
    });

    return {
        storedFilename,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype
    };
};

// ==========================================
// STORE PDF
// ==========================================

const storePdf = async (file) => {
    return storeFile(file, ".pdf");
};

// ==========================================
// STORE TEXT FILE
// ==========================================

const storeText = async (file) => {
    return storeFile(file, ".txt");
};

// ==========================================
// DELETE STORED FILE
// ==========================================

const deleteStoredFile = async (filePath) => {

    if (!filePath) {
        return;
    }

    await fs.rm(filePath, {
        force: true
    });
};

// ==========================================
// BACKWARD-COMPATIBLE PDF DELETION
// ==========================================

const deletePdf = async (filePath) => {
    return deleteStoredFile(filePath);
};

module.exports = {
    storePdf,
    storeText,
    deletePdf,
    deleteStoredFile
};
