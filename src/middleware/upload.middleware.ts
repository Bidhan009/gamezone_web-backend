import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileTypeFromFile } from "file-type";

// Ensure the uploads directory exists
// __dirname is the directory of the current module
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
} 

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    }
});
// First-pass filter: quick rejection based on claimed mimetype
// (cheap, but NOT trusted alone — real check happens after upload below)
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
};
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
});
// Real validation: verify actual file content matches a genuine image
// signature, regardless of what Content-Type the client claimed.
// If it doesn't match, delete the uploaded file and reject the request.
const verifyRealFileType = async (req: any, res: any, next: any) => {
    const files: Express.Multer.File[] = req.file
        ? [req.file]
        : req.files
        ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat())
        : [];

    for (const file of files) {
        const detected = await fileTypeFromFile(file.path);
        if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime)) {
            fs.unlinkSync(file.path); // delete the disguised file immediately
            return res.status(400).json({
                success: false,
                message: "File content does not match an allowed image type."
            });
        }
    }
    next();
};

export const uploads = {
    single: (fieldName: string) => [upload.single(fieldName),verifyRealFileType],
    array: (fieldName: string, maxCount: number) => [upload.array(fieldName, maxCount), verifyRealFileType],
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => [upload.fields(fieldsArray), verifyRealFileType]
};
