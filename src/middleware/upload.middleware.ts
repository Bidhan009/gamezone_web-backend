import multer from "multer";
import uuid from "uuid";
import path from "path";
import fs from "fs";

// Ensure the uploads directory exists
// __dirname is the directory of the current module
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
} 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('=== STORAGE DEBUG ===');
        console.log('Upload directory:', uploadDir);
        console.log('File for storage:', file);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuid.v4();
        const extension = path.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log('=== UPLOAD MIDDLEWARE DEBUG ===');
    console.log('File received for filtering:', file);
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
        console.log('File rejected - not an image:', file.mimetype);
        return cb(new Error('Only image files are allowed!'));
    }
    console.log('File accepted:', file.mimetype);
    cb(null, true);
};
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
});

export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray)
};
