import multer from "multer";
import path from "path";
import fs from "fs"

import AppError from "../errors/app-error.js";
import { ERROR_CODES } from "../utils/constants.js";

const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];
const createUploader = (folderName) => {
    const uploadPath = path.join(
        process.cwd(),
        "src",
        "uploads",
        folderName
    );

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination(req, file, cb) {
            cb(null, uploadPath);
        },

        filename(req, file, cb) {
            const extension = path.extname(file.originalname);
            const fileName = `${req.user.id}-${Date.now()}${extension}`;
            cb(null, fileName);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new AppError(
                    "Only image files are allowed.",
                    400,
                    ERROR_CODES.INVALID_FILE_TYPE
                ),
                false
            );
        }
        cb(null, true);
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB
        }
    });
};

export const uploadProfileImage = createUploader("profiles");

export default createUploader;